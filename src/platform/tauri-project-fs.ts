import { invoke, isTauri } from "@tauri-apps/api/core";
import {
  exists,
  mkdir,
  readDir,
  readFile,
  readTextFile,
  remove,
  rename,
  stat,
} from "@tauri-apps/plugin-fs";

import {
  createId,
  fileTypeFromPath,
  isReservedName,
  joinRelative,
  parseManifest,
  parseTrashIndex,
  PROJECT_DATA_DIR,
  PROJECT_EXTENSION,
  projectPaths,
  serializeTrashIndex,
  uniqueName,
  type ProjectEntry,
  type ProjectFs,
  type ProjectManifest,
  type TrashEntry,
} from "@shared/core";
import {
  childPath,
  copyTree,
  joinRel,
  nameOfRel,
  namesIn,
  parentPath,
  parentRel,
  sizeOfTree,
} from "./project-fs-tree";
import { writeAtomic } from "./write-atomic";

const encoder = new TextEncoder();

/** Whether a relative path is the data folder or inside it. */
function insideDataFolder(rel: string): boolean {
  return rel.split("/")[0]?.toLowerCase() === PROJECT_DATA_DIR;
}

/** Projects on disk through the Tauri file system plugin. */
export class TauriProjectFs implements ProjectFs {
  /** Trash index edits run one after another, so two edits never read the same old index. */
  private trashQueue: Promise<unknown> = Promise.resolve();

  async scan(root: string, rel = ""): Promise<ProjectEntry[]> {
    const dir = joinRelative(root, rel);
    const entries: ProjectEntry[] = [];
    for (const item of await readDir(dir)) {
      if (item.name.startsWith(".")) continue;
      const isRoot = rel === "";
      if (isRoot && item.name.toLowerCase().endsWith(`.${PROJECT_EXTENSION}`)) continue;
      const path = childPath(dir, item.name);
      let updatedAt: string | null = null;
      try {
        updatedAt = (await stat(path)).mtime?.toISOString() ?? null;
      } catch {
        // Gone since the listing, or unreadable: shown without a date.
      }
      const type = item.isDirectory ? null : fileTypeFromPath(item.name);
      entries.push({
        name: item.name,
        rel: joinRel(rel, item.name),
        kind: item.isDirectory ? "folder" : (type ?? "other"),
        updatedAt,
      });
    }
    return entries;
  }

  async createFolder(root: string, rel: string): Promise<string> {
    const name = nameOfRel(rel);
    if (isReservedName(name)) throw new Error(`"${name}" can't be used as a name.`);
    const parent = parentRel(rel);
    const free = uniqueName(name, await namesIn(joinRelative(root, parent)));
    const target = joinRel(parent, free);
    await mkdir(joinRelative(root, target), { recursive: true });
    return target;
  }

  async move(root: string, fromRel: string, toFolderRel: string): Promise<string> {
    if (insideDataFolder(fromRel) || insideDataFolder(toFolderRel)) {
      throw new Error("The project data folder can't be moved into or out of.");
    }
    if (toFolderRel === fromRel || toFolderRel.startsWith(`${fromRel}/`)) {
      throw new Error("A folder can't be moved into itself.");
    }
    const name = uniqueName(nameOfRel(fromRel), await namesIn(joinRelative(root, toFolderRel)));
    const target = joinRel(toFolderRel, name);
    await rename(joinRelative(root, fromRel), joinRelative(root, target));
    return target;
  }

  async rename(root: string, rel: string, name: string): Promise<string> {
    if (isReservedName(name)) throw new Error(`"${name}" can't be used as a name.`);
    const parent = parentRel(rel);
    const taken = await namesIn(joinRelative(root, parent));
    taken.delete(nameOfRel(rel));
    const target = joinRel(parent, uniqueName(name, taken));
    if (target !== rel) await rename(joinRelative(root, rel), joinRelative(root, target));
    return target;
  }

  async duplicate(root: string, rel: string): Promise<string> {
    const parent = parentRel(rel);
    const name = uniqueName(nameOfRel(rel), await namesIn(joinRelative(root, parent)));
    const target = joinRel(parent, name);
    await copyTree(joinRelative(root, rel), joinRelative(root, target));
    return target;
  }

  async toTrash(root: string, rel: string): Promise<TrashEntry> {
    if (insideDataFolder(rel)) throw new Error("The project data folder can't be deleted.");
    const paths = projectPaths(root);
    const source = joinRelative(root, rel);
    const info = await stat(source);
    const name = nameOfRel(rel);
    const entry: TrashEntry = {
      id: createId(),
      name,
      from: rel,
      deletedAt: new Date().toISOString(),
      size: await sizeOfTree(source),
      folder: info.isDirectory,
    };
    await this.ensureDataFolder(root);
    const holder = childPath(paths.trash, entry.id);
    await mkdir(holder, { recursive: true });
    await rename(source, childPath(holder, name));
    await this.editTrash(root, (entries) => [...entries, entry]);
    return entry;
  }

  async restore(root: string, entryId: string): Promise<string> {
    const paths = projectPaths(root);
    const entry = (await this.listTrash(root)).find((e) => e.id === entryId);
    if (!entry) throw new Error(`Unknown trash entry: ${entryId}`);
    const parent = parentRel(entry.from);
    const parentDir = joinRelative(root, parent);
    await mkdir(parentDir, { recursive: true });
    const name = uniqueName(entry.name, await namesIn(parentDir));
    const holder = childPath(paths.trash, entry.id);
    await rename(childPath(holder, entry.name), childPath(parentDir, name));
    await remove(holder, { recursive: true }).catch(() => undefined);
    await this.editTrash(root, (entries) => entries.filter((e) => e.id !== entryId));
    return joinRel(parent, name);
  }

  async removeFromTrash(root: string, entryIds: string[] | "all"): Promise<void> {
    const paths = projectPaths(root);
    const entries = await this.listTrash(root);
    const gone = entryIds === "all" ? entries : entries.filter((e) => entryIds.includes(e.id));
    for (const entry of gone) {
      const holder = childPath(paths.trash, entry.id);
      if (await exists(holder)) await remove(holder, { recursive: true });
    }
    const ids = new Set(gone.map((e) => e.id));
    await this.editTrash(root, (all) => all.filter((e) => !ids.has(e.id)));
  }

  async listTrash(root: string): Promise<TrashEntry[]> {
    const index = projectPaths(root).trashIndex;
    return (await exists(index)) ? parseTrashIndex(await readTextFile(index)) : [];
  }

  size(path: string): Promise<number> {
    return sizeOfTree(path);
  }

  readText(path: string): Promise<string> {
    return readTextFile(path);
  }

  writeTextAtomic(path: string, text: string): Promise<void> {
    return writeAtomic(path, encoder.encode(text));
  }

  readBytes(path: string): Promise<Uint8Array> {
    return readFile(path);
  }

  writeBytesAtomic(path: string, bytes: Uint8Array): Promise<void> {
    return writeAtomic(path, bytes);
  }

  exists(path: string): Promise<boolean> {
    return exists(path);
  }

  async makeHidden(path: string): Promise<void> {
    if (isTauri()) await invoke("set_hidden", { path });
  }

  async findManifestAbove(filePath: string, projectId: string): Promise<string | null> {
    let dir = parentPath(filePath);
    while (dir !== null) {
      if (await this.hasManifest(dir, projectId)) return dir;
      dir = parentPath(dir);
    }
    return null;
  }

  async readManifest(root: string): Promise<ProjectManifest | null> {
    return (await this.manifestsIn(root))[0] ?? null;
  }

  /** Whether `dir` holds a `.cproject` with this id; unreadable ones don't count. */
  private async hasManifest(dir: string, projectId: string): Promise<boolean> {
    return (await this.manifestsIn(dir)).some((manifest) => manifest.id === projectId);
  }

  /** The readable manifests of the `.cproject` files directly in `dir`. */
  private async manifestsIn(dir: string): Promise<ProjectManifest[]> {
    let items;
    try {
      items = await readDir(dir);
    } catch {
      return [];
    }
    const found: ProjectManifest[] = [];
    for (const item of items) {
      if (!item.isFile || !item.name.toLowerCase().endsWith(`.${PROJECT_EXTENSION}`)) continue;
      try {
        found.push(parseManifest(await readTextFile(childPath(dir, item.name))));
      } catch {
        // Not a readable manifest: keep looking.
      }
    }
    return found;
  }

  /** Makes `.cloudy` (hidden on Windows) when the project has none yet. */
  private async ensureDataFolder(root: string): Promise<void> {
    const data = projectPaths(root).data;
    if (await exists(data)) return;
    await mkdir(data, { recursive: true });
    await this.makeHidden(data);
  }

  /** Reads the trash index, applies `edit` and writes it back, after any edit already running. */
  private editTrash(root: string, edit: (entries: TrashEntry[]) => TrashEntry[]): Promise<void> {
    const run = this.trashQueue.then(async () => {
      const entries = edit(await this.listTrash(root));
      await this.ensureDataFolder(root);
      await mkdir(projectPaths(root).trash, { recursive: true });
      await this.writeTextAtomic(projectPaths(root).trashIndex, serializeTrashIndex(entries));
    });
    this.trashQueue = run.catch(() => undefined);
    return run;
  }
}
