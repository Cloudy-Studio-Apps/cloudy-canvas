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
  fileTypeFromPath,
  isReservedName,
  joinRelative,
  LIBRARIES_DIR,
  parseManifest,
  PROJECT_DATA_DIR,
  PROJECT_EXTENSION,
  projectPaths,
  uniqueName,
  type FoundManifest,
  type ManifestFile,
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
import { TauriProjectTrash } from "./tauri-project-trash";
import { writeAtomic } from "./write-atomic";

const encoder = new TextEncoder();

/** Whether a relative path is the data folder or inside it. */
function insideDataFolder(rel: string): boolean {
  return rel.split("/")[0]?.toLowerCase() === PROJECT_DATA_DIR;
}

/** Whether a relative path is a library's file or `.assets` folder, which the trash takes. */
function isLibraryItem(rel: string): boolean {
  const parts = rel.split("/");
  const name = parts[2]?.toLowerCase() ?? "";
  return (
    parts.length === 3 &&
    (name.endsWith(".clib") || name.endsWith(".assets")) &&
    parts[0]?.toLowerCase() === PROJECT_DATA_DIR &&
    parts[1]?.toLowerCase() === LIBRARIES_DIR
  );
}

/** Projects on disk through the Tauri file system plugin. */
export class TauriProjectFs implements ProjectFs {
  private readonly trash = new TauriProjectTrash((root) => this.ensureDataFolder(root));

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

  toTrash(root: string, rel: string): Promise<TrashEntry> {
    if (insideDataFolder(rel) && !isLibraryItem(rel)) {
      return Promise.reject(new Error("The project data folder can't be deleted."));
    }
    return this.trash.put(root, rel);
  }

  copyToTrash(root: string, name: string, bytes: Uint8Array): Promise<TrashEntry> {
    if (isReservedName(name))
      return Promise.reject(new Error(`"${name}" can't be used as a name.`));
    return this.trash.putCopy(root, name, bytes);
  }

  restore(root: string, entryId: string): Promise<string> {
    return this.trash.restore(root, entryId);
  }

  removeFromTrash(root: string, entryIds: string[] | "all"): Promise<void> {
    return this.trash.remove(root, entryIds);
  }

  listTrash(root: string): Promise<TrashEntry[]> {
    return this.trash.list(root);
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

  async removeFile(path: string): Promise<void> {
    if (!(await stat(path)).isFile) throw new Error(`"${path}" isn't a file.`);
    await remove(path);
  }

  async makeHidden(path: string): Promise<void> {
    if (isTauri()) await invoke("set_hidden", { path });
  }

  async findManifestAbove(filePath: string, projectId: string): Promise<FoundManifest | null> {
    let dir = parentPath(filePath);
    while (dir !== null) {
      const files = await this.manifestsIn(dir);
      const found =
        files.find((f) => f.manifest.id === projectId) ??
        files.find((f) => f.manifest.copiedFrom === projectId);
      if (found) return { ...found, root: dir };
      dir = parentPath(dir);
    }
    return null;
  }

  async readManifest(root: string, id?: string): Promise<ProjectManifest | null> {
    return (await this.readManifestFile(root, id))?.manifest ?? null;
  }

  async readManifestFile(root: string, id?: string): Promise<ManifestFile | null> {
    const files = await this.manifestsIn(root);
    return (id === undefined ? files[0] : files.find((f) => f.manifest.id === id)) ?? null;
  }

  /** The readable manifests of the `.cproject` files directly in `dir`. */
  private async manifestsIn(dir: string): Promise<ManifestFile[]> {
    let items;
    try {
      items = await readDir(dir);
    } catch {
      return [];
    }
    const found: ManifestFile[] = [];
    for (const item of items) {
      if (!item.isFile || !item.name.toLowerCase().endsWith(`.${PROJECT_EXTENSION}`)) continue;
      const path = childPath(dir, item.name);
      try {
        found.push({ manifest: parseManifest(await readTextFile(path)), file: item.name, path });
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
}
