import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import {
  createId,
  CURRENT_FORMAT_VERSION,
  fileNameFromPath,
  fileTypeFromPath,
  type FileInfo,
  type Storage,
} from "@core";

/** Recent files index, kept in the app data folder. */
const INDEX_FILE = "recent-files.json";
const MAX_RECENTS = 50;

/** Desktop storage: files live wherever the user saved them; an index remembers recent ones. */
export class TauriStorage implements Storage {
  async list(): Promise<FileInfo[]> {
    return this.readIndex();
  }

  async get(id: string): Promise<FileInfo | null> {
    return (await this.readIndex()).find((file) => file.id === id) ?? null;
  }

  async register(path: string): Promise<FileInfo> {
    const type = fileTypeFromPath(path);
    if (!type) throw new Error(`Not a Cloudy Canvas file: ${path}`);
    const files = await this.readIndex();
    const now = new Date().toISOString();
    const file: FileInfo = files.find((f) => f.path === path) ?? {
      id: createId(),
      name: fileNameFromPath(path),
      type,
      path,
      createdAt: now,
      updatedAt: now,
      formatVersion: CURRENT_FORMAT_VERSION,
    };
    await this.writeIndex([file, ...files.filter((f) => f.id !== file.id)]);
    return file;
  }

  async load(id: string): Promise<Uint8Array> {
    const file = await this.get(id);
    if (!file) throw new Error(`Unknown file id: ${id}`);
    return readFile(file.path);
  }

  async save(id: string, path: string, data: Uint8Array): Promise<FileInfo> {
    const type = fileTypeFromPath(path);
    if (!type) throw new Error(`Not a Cloudy Canvas file: ${path}`);
    await writeFile(path, data);
    const files = await this.readIndex();
    const now = new Date().toISOString();
    const previous = files.find((f) => f.id === id);
    const file: FileInfo = {
      id,
      name: fileNameFromPath(path),
      type,
      path,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
      formatVersion: CURRENT_FORMAT_VERSION,
    };
    // Saving over another recent file's path replaces that entry.
    await this.writeIndex([file, ...files.filter((f) => f.id !== id && f.path !== path)]);
    return file;
  }

  private async readIndex(): Promise<FileInfo[]> {
    if (!isTauri()) return [];
    const path = await indexPath();
    if (!(await exists(path))) return [];
    try {
      const parsed: unknown = JSON.parse(await readTextFile(path));
      return Array.isArray(parsed) ? (parsed as FileInfo[]) : [];
    } catch (error) {
      console.error("[storage] Recent files index is unreadable; starting fresh.", error);
      return [];
    }
  }

  private async writeIndex(files: FileInfo[]): Promise<void> {
    if (!isTauri()) throw new Error("Saving files is only available in the desktop app.");
    await mkdir(await appDataDir(), { recursive: true });
    await writeTextFile(await indexPath(), JSON.stringify(files.slice(0, MAX_RECENTS), null, 2));
  }
}

async function indexPath(): Promise<string> {
  return join(await appDataDir(), INDEX_FILE);
}
