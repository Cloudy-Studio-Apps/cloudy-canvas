import { exists, mkdir, readTextFile, remove, rename, stat } from "@tauri-apps/plugin-fs";

import {
  createId,
  joinRelative,
  parseTrashIndex,
  projectPaths,
  serializeTrashIndex,
  uniqueName,
  type TrashEntry,
} from "@shared/core";
import { childPath, joinRel, nameOfRel, namesIn, parentRel, sizeOfTree } from "./project-fs-tree";
import { writeAtomic } from "./write-atomic";

const encoder = new TextEncoder();

/**
 * A project's trash (`.cloudy/trash/<entry id>/<name>` and `index.json`) through the Tauri fs
 * plugin. Every change that writes the index runs after the one before (one queue), and an item
 * goes in only after its index entry is written: an entry whose item isn't there is left out of
 * `list` (and dropped by the next write), so a crash midway leaves nothing invisible.
 */
export class TauriProjectTrash {
  private queue: Promise<unknown> = Promise.resolve();

  /** `ensureDataFolder` makes `.cloudy` (hidden) when the project has none. */
  constructor(private readonly ensureDataFolder: (root: string) => Promise<void>) {}

  /** Moves `rel` (the caller has checked it may go) into the trash. */
  async put(root: string, rel: string): Promise<TrashEntry> {
    const source = joinRelative(root, rel);
    const info = await stat(source);
    const entry = this.entryFor(nameOfRel(rel), rel, await sizeOfTree(source), info.isDirectory);
    return this.adding(root, entry, (target) => rename(source, target));
  }

  /**
   * Puts a copy of a file from outside the project (`bytes`) into its trash, as if `name` had
   * been deleted from the project's root: restoring it puts it there.
   */
  putCopy(root: string, name: string, bytes: Uint8Array): Promise<TrashEntry> {
    const entry = this.entryFor(name, name, bytes.length, false);
    return this.adding(root, entry, (target) => writeAtomic(target, bytes));
  }

  async restore(root: string, entryId: string): Promise<string> {
    const paths = projectPaths(root);
    const entry = (await this.list(root)).find((e) => e.id === entryId);
    if (!entry) throw new Error(`Unknown trash entry: ${entryId}`);
    const parent = parentRel(entry.from);
    const parentDir = joinRelative(root, parent);
    await mkdir(parentDir, { recursive: true });
    const name = uniqueName(entry.name, await namesIn(parentDir));
    const holder = childPath(paths.trash, entry.id);
    await rename(childPath(holder, entry.name), childPath(parentDir, name));
    await remove(holder, { recursive: true }).catch(() => undefined);
    await this.edit(root, (entries) => entries.filter((e) => e.id !== entryId));
    return joinRel(parent, name);
  }

  async remove(root: string, entryIds: string[] | "all"): Promise<void> {
    const paths = projectPaths(root);
    const entries = await this.list(root);
    const gone = entryIds === "all" ? entries : entries.filter((e) => entryIds.includes(e.id));
    for (const entry of gone) {
      const holder = childPath(paths.trash, entry.id);
      if (await exists(holder)) await remove(holder, { recursive: true });
    }
    const ids = new Set(gone.map((e) => e.id));
    await this.edit(root, (all) => all.filter((e) => !ids.has(e.id)));
  }

  /** The index's entries whose item is in the trash. */
  async list(root: string): Promise<TrashEntry[]> {
    const paths = projectPaths(root);
    if (!(await exists(paths.trashIndex))) return [];
    const entries = parseTrashIndex(await readTextFile(paths.trashIndex));
    const present = await Promise.all(
      entries.map((e) => exists(childPath(childPath(paths.trash, e.id), e.name))),
    );
    return entries.filter((_, i) => present[i]);
  }

  private entryFor(name: string, from: string, size: number, folder: boolean): TrashEntry {
    return { id: createId(), name, from, deletedAt: new Date().toISOString(), size, folder };
  }

  /** Records `entry`, then `place`s its item in its holder; a failed place takes the entry out. */
  private adding(
    root: string,
    entry: TrashEntry,
    place: (target: string) => Promise<void>,
  ): Promise<TrashEntry> {
    return this.queued(async () => {
      await this.write(root, (entries) => [...entries, entry]);
      try {
        const holder = childPath(projectPaths(root).trash, entry.id);
        await mkdir(holder, { recursive: true });
        await place(childPath(holder, entry.name));
      } catch (error) {
        await this.write(root, (entries) => entries.filter((e) => e.id !== entry.id)).catch(
          () => undefined,
        );
        throw error;
      }
      return entry;
    });
  }

  /** Reads the index, applies `edit` and writes it back, after any change already running. */
  private edit(root: string, edit: (entries: TrashEntry[]) => TrashEntry[]): Promise<void> {
    return this.queued(() => this.write(root, edit));
  }

  private queued<T>(run: () => Promise<T>): Promise<T> {
    const result = this.queue.then(run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /** Writes the index with `edit` applied; only from inside the queue. */
  private async write(root: string, edit: (entries: TrashEntry[]) => TrashEntry[]): Promise<void> {
    const paths = projectPaths(root);
    const entries = edit(await this.list(root));
    await this.ensureDataFolder(root);
    await mkdir(paths.trash, { recursive: true });
    await writeAtomic(paths.trashIndex, encoder.encode(serializeTrashIndex(entries)));
  }
}
