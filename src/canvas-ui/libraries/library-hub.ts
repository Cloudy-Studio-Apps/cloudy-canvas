import { assetKindOf, contentHash, keyBetween, LibraryDocument } from "@canvas";
import type { LibraryAsset } from "@canvas";
import {
  createId,
  joinRelative,
  projectPaths,
  relativeTo,
  type LibraryEntry,
  type ProjectRecord,
} from "@shared/core";
import { appLifecycle, projectFs } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import type {
  HeldHub,
  HubCount,
  LibraryAssetInput,
  LibraryEdits,
  LibraryHubListener,
} from "./library-hub.types";
import { LibrarySaver } from "./library-saver";
import { t } from "./libraries.i18n";

/** The hubs open now, by project id, with how many openers hold each. */
const hubs = new Map<string, HeldHub<LibraryHub>>();
/** The saves of hubs being closed, by project id: opening again waits for them. */
const closing = new Map<string, Promise<void>>();

/**
 * A project's libraries in memory while something uses them (an editor, the project home): one
 * per project, shared by its openers (`open`, `close`). Edits are written to the libraries per
 * item, the later one winning, and each changed `.clib` is saved 300 ms after its last edit,
 * atomically; closing (and quitting the app) saves what's pending.
 */
export class LibraryHub {
  private readonly listeners = new Set<LibraryHubListener>();
  private readonly saver: LibrarySaver;
  private readonly releases: (() => void)[] = [];

  /** The hub of a project, loading its libraries the first time. Each call needs a `close`. */
  static async open(record: ProjectRecord): Promise<LibraryHub> {
    let held = hubs.get(record.id);
    if (!held) {
      const count: HubCount = { refs: 0 };
      held = { hub: LibraryHub.load(record, count), count };
      hubs.set(record.id, held);
    }
    const { count } = held;
    count.refs++;
    try {
      return await held.hub;
    } catch (error) {
      if (--count.refs === 0 && hubs.get(record.id)?.count === count) hubs.delete(record.id);
      throw error;
    }
  }

  private static async load(record: ProjectRecord, count: HubCount): Promise<LibraryHub> {
    await closing.get(record.id);
    const manifest = await projectFs.readManifest(record.root, record.id);
    if (!manifest) throw new Error(`The project ${record.id} isn't in ${record.root}`);
    const paths = projectPaths(record.root);
    const entries = [...manifest.libraries].sort((a, b) =>
      a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
    );
    const loaded: [LibraryEntry, LibraryDocument][] = [];
    const unreadable: string[] = [];
    for (const entry of entries) {
      try {
        const bytes = await projectFs.readBytes(paths.library(entry.file));
        loaded.push([entry, LibraryDocument.fromFile(bytes)]);
      } catch (error) {
        console.warn(`Library ${entry.file} couldn't be read`, error);
        unreadable.push(entry.name);
      }
    }
    if (unreadable.length > 0) {
      notifyError(t("hub.unreadable"), new Error(unreadable.join(", ")));
    }
    return new LibraryHub(record, loaded, count);
  }

  private constructor(
    readonly project: ProjectRecord,
    private readonly loaded: readonly [LibraryEntry, LibraryDocument][],
    private readonly count: HubCount,
  ) {
    const paths = projectPaths(project.root);
    this.saver = new LibrarySaver(
      projectFs,
      (id) => {
        const entry = this.entry(id);
        return entry ? paths.library(entry.file) : null;
      },
      (error) => notifyError(t("hub.saveFailed"), error),
    );
    for (const [entry, library] of loaded) {
      this.releases.push(
        library.observe(() => {
          this.saver.schedule(entry.id, () => library);
          const ids = new Set([entry.id]);
          for (const listener of this.listeners) listener(ids);
        }),
      );
    }
    this.releases.push(appLifecycle.onBeforeQuit(() => this.saver.flush()));
  }

  /** The project's libraries that could be read, in its order. */
  libraries(): LibraryDocument[] {
    return this.loaded.map(([, library]) => library);
  }

  /** The manifest entries of the libraries `libraries()` holds. */
  entries(): LibraryEntry[] {
    return this.loaded.map(([entry]) => entry);
  }

  library(id: string): LibraryDocument | undefined {
    return this.loaded.find(([entry]) => entry.id === id)?.[1];
  }

  /** Writes a file's edits to the libraries (unknown libraries are skipped). */
  apply(edits: LibraryEdits): void {
    for (const [id, edit] of edits) {
      const library = this.library(id);
      if (!library) continue;
      if (edit.put.length > 0) library.setTokenRecords(edit.put);
      if (edit.removed.length > 0) library.removeTokenRecords(edit.removed);
    }
  }

  /** Fires with the ids of the libraries that changed. */
  onChange(listener: LibraryHubListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Adds a picture to a library: its bytes as a file in the library's `.assets/` folder and its
   * metadata in the library. A picture the library has already (same bytes) is returned as it is.
   */
  async addAssetFile(
    libraryId: string,
    bytes: Uint8Array,
    input: LibraryAssetInput,
  ): Promise<LibraryAsset> {
    const entry = this.entry(libraryId);
    const library = this.library(libraryId);
    if (!entry || !library) throw new Error(`No library ${libraryId} in this project`);
    const hash = await contentHash(bytes);
    const known = library.assets().find((asset) => asset.hash === hash);
    if (known) return known;
    const folder = projectPaths(this.project.root).libraryAssets(entry.file);
    if (!(await projectFs.exists(folder))) {
      await projectFs.createFolder(this.project.root, relativeTo(this.project.root, folder));
    }
    const asset: LibraryAsset = {
      ...input,
      id: createId(),
      hash,
      kind: assetKindOf(input.type),
      order: keyBetween(library.assets().at(-1)?.order ?? null, null),
    };
    await projectFs.writeBytesAtomic(joinRelative(folder, `${asset.id}.${asset.ext}`), bytes);
    library.putAsset(asset);
    return asset;
  }

  /** The bytes of a library's picture, read from its file. */
  readAssetBytes(libraryId: string, assetId: string): Promise<Uint8Array> {
    const entry = this.entry(libraryId);
    const asset = this.library(libraryId)
      ?.assets()
      .find((item) => item.id === assetId);
    if (!entry || !asset) return Promise.reject(new Error(`No asset ${assetId} in ${libraryId}`));
    const folder = projectPaths(this.project.root).libraryAssets(entry.file);
    return projectFs.readBytes(joinRelative(folder, `${asset.id}.${asset.ext}`));
  }

  /** Lets go of the hub; the last opener's close saves what's pending and drops it. */
  async close(): Promise<void> {
    if (this.count.refs === 0 || --this.count.refs > 0) return;
    if (hubs.get(this.project.id)?.count === this.count) hubs.delete(this.project.id);
    for (const release of this.releases) release();
    this.listeners.clear();
    const saved = this.saver.flush();
    closing.set(this.project.id, saved);
    await saved;
    if (closing.get(this.project.id) === saved) closing.delete(this.project.id);
  }

  private entry(id: string): LibraryEntry | undefined {
    return this.loaded.find(([entry]) => entry.id === id)?.[0];
  }
}
