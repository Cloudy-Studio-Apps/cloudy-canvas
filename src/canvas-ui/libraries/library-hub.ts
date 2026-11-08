import {
  assetKindOf,
  contentHash,
  keyBetween,
  withoutForeignRecords,
  type LibraryAsset,
  type LibraryDocument,
} from "@canvas";
import { createId, projectPaths, type LibraryEntry, type ProjectRecord } from "@shared/core";
import { appLifecycle, projectFs } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { assetFilePath, readLibrary, sortedLibraries, writeAssetFile } from "./library-files";
import type {
  HeldHub,
  HubCount,
  LibraryAssetInput,
  LibraryEdits,
  LibraryHubListener,
  OpenedHub,
} from "./library-hub.types";
import { LibrarySaver } from "./library-saver";
import { t } from "./libraries.i18n";

/** The hubs open now, by project id, with how many openers hold each. */
const hubs = new Map<string, HeldHub<LibraryHub>>();
/** The saves of hubs being closed, by project id: opening again waits for them. */
const closing = new Map<string, Promise<void>>();

/**
 * A project's libraries in memory while something uses them (an editor, the project home): one
 * per project, shared by its openers (`open` gives each a `release`). Edits are written to the
 * libraries per item, the later one winning, and each changed `.clib` is saved 300 ms after its
 * last edit, atomically; the last release (and quitting the app) saves what's pending.
 */
export class LibraryHub {
  private list: LibraryEntry[] = [];
  private readonly docs = new Map<string, LibraryDocument>();
  private readonly failed = new Set<string>();
  private readonly observers = new Map<string, () => void>();
  private readonly listeners = new Set<LibraryHubListener>();
  private readonly saver: LibrarySaver;
  private readonly releaseQuit: () => void;
  /** Who the `apply` running now is for, handed to the listeners. */
  private applying: unknown = null;
  private refreshing: Promise<void> = Promise.resolve();

  /** The hub of a project, loading its libraries the first time. Each opener calls `release`. */
  static async open(record: ProjectRecord): Promise<OpenedHub> {
    let held = hubs.get(record.id);
    if (!held) {
      const count: HubCount = { refs: 0 };
      held = { hub: LibraryHub.load(record, count), count };
      hubs.set(record.id, held);
    }
    const { count } = held;
    count.refs++;
    let hub: LibraryHub;
    try {
      hub = await held.hub;
    } catch (error) {
      if (--count.refs === 0 && hubs.get(record.id)?.count === count) hubs.delete(record.id);
      throw error;
    }
    let released = false;
    return {
      hub,
      release: () => {
        if (released) return Promise.resolve();
        released = true;
        return hub.release();
      },
    };
  }

  private static async load(record: ProjectRecord, count: HubCount): Promise<LibraryHub> {
    await closing.get(record.id);
    const hub = new LibraryHub(record, count);
    try {
      await hub.readManifest();
    } catch (error) {
      hub.dispose();
      throw error;
    }
    return hub;
  }

  private constructor(
    readonly project: ProjectRecord,
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
    this.releaseQuit = appLifecycle.onBeforeQuit(() => this.saver.flush());
  }

  /** Every library of the project's manifest, in its order (loaded or not). */
  entries(): LibraryEntry[] {
    return [...this.list];
  }

  /** The libraries that could be read, in the project's order. */
  libraries(): LibraryDocument[] {
    return this.list.flatMap((entry) => this.docs.get(entry.id) ?? []);
  }

  library(id: string): LibraryDocument | undefined {
    return this.docs.get(id);
  }

  /** The manifest's libraries whose `.clib` couldn't be read. */
  unreadable(): ReadonlySet<string> {
    return this.failed;
  }

  /**
   * Reads the manifest again: libraries added since load in, removed ones out (their pending save
   * dropped), unreadable ones tried again. Listeners hear the ids that changed, so open files
   * mirror again.
   */
  refresh(): Promise<void> {
    const run = this.refreshing.then(async () => {
      const changed = await this.readManifest();
      if (changed.size > 0) this.emit(changed, null);
    });
    this.refreshing = run.catch(() => undefined);
    return run;
  }

  /**
   * Writes a file's edits to the libraries (unknown libraries are skipped); `from` is told back.
   * A record another library holds isn't put (one id, one library; `withoutForeignRecords`).
   */
  apply(edits: LibraryEdits, from: unknown = null): void {
    this.applying = from;
    try {
      const released = new Map([...edits].map(([id, edit]) => [id, new Set(edit.removed)]));
      const loaded = this.libraries();
      for (const [id, edit] of edits) {
        const library = this.library(id);
        if (!library) continue;
        const put = withoutForeignRecords(edit.put, id, loaded, released);
        if (put.length > 0) library.setTokenRecords(put);
        if (edit.removed.length > 0) library.removeTokenRecords(edit.removed);
      }
    } finally {
      this.applying = null;
    }
  }

  /**
   * Points a library at a new file name in memory (its file was renamed on disk), so a save at
   * any moment, quitting included, writes to the right place. `refresh()` reads the manifest.
   */
  relocate(libraryId: string, file: string): void {
    this.list = this.list.map((entry) => (entry.id === libraryId ? { ...entry, file } : entry));
  }

  /** Writes a library's pending edits to its file now and waits until every save has ended. */
  flush(libraryId: string): Promise<void> {
    return this.saver.flushOne(libraryId);
  }

  /**
   * Saves a library, then holds its later edits back (in memory only) until the returned function
   * runs, so its file can be renamed: call `refresh()` before releasing, and the held edits are
   * written to the new name.
   */
  hold(libraryId: string): Promise<() => void> {
    return this.saver.hold(libraryId);
  }

  /** Fires with the ids of the libraries that changed and who applied the change (`null`: none). */
  onChange(listener: LibraryHubListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Adds a picture to a library: its bytes as a file in the library's `.assets/` folder and its
   * metadata in the library, under `id` when given (a file's own picture moving in keeps its id). A picture
   * the library has already (same bytes) is returned as it is, under whatever id it has.
   */
  async addAssetFile(
    libraryId: string,
    bytes: Uint8Array,
    input: LibraryAssetInput,
    id?: string,
  ): Promise<LibraryAsset> {
    const entry = this.entry(libraryId);
    const library = this.library(libraryId);
    if (!entry || !library) throw new Error(`No library ${libraryId} in this project`);
    const hash = await contentHash(bytes);
    const known = library.assets().find((asset) => asset.hash === hash);
    if (known) return known;
    const asset: LibraryAsset = {
      ...input,
      id: id ?? createId(),
      hash,
      kind: assetKindOf(input.type),
      order: keyBetween(library.assets().at(-1)?.order ?? null, null),
    };
    await writeAssetFile(this.project.root, entry, asset, bytes);
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
    return projectFs.readBytes(assetFilePath(this.project.root, entry, asset));
  }

  /** One opener lets go; the last one saves what's pending and drops the hub. */
  private async release(): Promise<void> {
    if (--this.count.refs > 0) return;
    if (hubs.get(this.project.id)?.count === this.count) hubs.delete(this.project.id);
    this.dispose();
    const saved = this.saver.flush();
    closing.set(this.project.id, saved);
    await saved;
    if (closing.get(this.project.id) === saved) closing.delete(this.project.id);
  }

  private dispose(): void {
    for (const off of this.observers.values()) off();
    this.observers.clear();
    this.releaseQuit();
    this.listeners.clear();
  }

  /** Syncs the libraries held with the manifest; returns the ids added, removed or now read. */
  private async readManifest(): Promise<Set<string>> {
    const { root, id } = this.project;
    const manifest = await projectFs.readManifest(root, id);
    if (!manifest) throw new Error(`The project ${id} isn't in ${root}`);
    const entries = sortedLibraries(manifest);
    const listed = new Set(entries.map((entry) => entry.id));
    const changed = new Set<string>();
    for (const known of [...this.docs.keys(), ...this.failed]) {
      if (listed.has(known)) continue;
      this.drop(known);
      changed.add(known);
    }
    const unreadable: string[] = [];
    for (const entry of entries) {
      if (this.docs.has(entry.id)) continue;
      try {
        this.adopt(entry.id, await readLibrary(root, entry));
        this.failed.delete(entry.id);
        changed.add(entry.id);
      } catch (error) {
        console.warn(`Library ${entry.file} couldn't be read`, error);
        if (!this.failed.has(entry.id)) unreadable.push(entry.name);
        this.failed.add(entry.id);
      }
    }
    this.list = entries;
    if (unreadable.length > 0) notifyError(t("hub.unreadable"), new Error(unreadable.join(", ")));
    return changed;
  }

  private adopt(id: string, library: LibraryDocument): void {
    this.docs.set(id, library);
    this.observers.set(
      id,
      library.observe(() => {
        this.saver.schedule(id, () => library);
        this.emit(new Set([id]), this.applying);
      }),
    );
  }

  private drop(id: string): void {
    this.observers.get(id)?.();
    this.observers.delete(id);
    this.docs.delete(id);
    this.failed.delete(id);
    this.saver.cancel(id);
  }

  private emit(ids: ReadonlySet<string>, from: unknown): void {
    for (const listener of this.listeners) listener(ids, from);
  }

  private entry(id: string): LibraryEntry | undefined {
    return this.list.find((entry) => entry.id === id);
  }
}
