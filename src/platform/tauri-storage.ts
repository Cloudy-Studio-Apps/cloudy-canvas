import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  readTextFile,
  rename,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import {
  createId,
  CURRENT_FORMAT_VERSION,
  fileNameFromPath,
  fileTypeFromPath,
  isFileInfo,
  type FileInfo,
  type FileType,
  type Storage,
} from "@shared/core";
import type { IndexEdit } from "./tauri-storage.types";

/** Recent files index, kept in the app data folder. */
const INDEX_FILE = "recent-files.json";
/** Where an unreadable index is moved, so nothing is lost for good. */
const CORRUPT_INDEX_FILE = "recent-files.corrupt.json";
const MAX_RECENTS = 50;

/** Desktop storage: files live wherever the user saved them; an index remembers recent ones. */
export class TauriStorage implements Storage {
  /** Index edits run one after another, so two edits never read the same old index. */
  private queue: Promise<unknown> = Promise.resolve();
  private indexReset = false;

  async list(): Promise<FileInfo[]> {
    return this.readIndex();
  }

  async get(id: string): Promise<FileInfo | null> {
    return (await this.readIndex()).find((file) => file.id === id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    const file = await this.get(id);
    return file !== null && (await exists(file.path));
  }

  register(path: string): Promise<FileInfo> {
    const type = requireFileType(path);
    return this.mutate((files) => {
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
      return { files: [file, ...files.filter((f) => f.id !== file.id)], result: file };
    });
  }

  relocate(id: string, path: string): Promise<FileInfo> {
    const type = requireFileType(path);
    return this.mutate((files) => {
      const previous = files.find((f) => f.id === id);
      if (!previous) throw new Error(`Unknown file id: ${id}`);
      if (previous.type !== type) {
        throw new Error(`"${fileNameFromPath(path)}" isn't a ${previous.type} file.`);
      }
      const file: FileInfo = { ...previous, path, name: fileNameFromPath(path) };
      // Another entry for the new path is the same file now.
      const rest = files.filter((f) => f.id !== id && f.path !== path);
      return { files: [file, ...rest], result: file };
    });
  }

  forget(id: string): Promise<void> {
    return this.mutate((files) => ({ files: files.filter((f) => f.id !== id), result: undefined }));
  }

  clear(): Promise<void> {
    return this.mutate(() => ({ files: [], result: undefined }));
  }

  async indexLocation(): Promise<string | null> {
    return isTauri() ? indexPath(INDEX_FILE) : null;
  }

  async load(id: string): Promise<Uint8Array> {
    const file = await this.get(id);
    if (!file) throw new Error(`Unknown file id: ${id}`);
    if (!(await exists(file.path))) {
      throw new Error(`"${file.name}" was moved or deleted. It was at ${file.path}.`);
    }
    return readFile(file.path);
  }

  async save(id: string, path: string, data: Uint8Array): Promise<FileInfo> {
    const type = requireFileType(path);
    // Write beside the file and swap it in, so a failed save never leaves half a file.
    await writeFile(`${path}.tmp`, data);
    await rename(`${path}.tmp`, path);
    return this.mutate((files) => {
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
      const rest = files.filter((f) => f.id !== id && f.path !== path);
      return { files: [file, ...rest], result: file };
    });
  }

  takeIndexReset(): boolean {
    const reset = this.indexReset;
    this.indexReset = false;
    return reset;
  }

  /** Reads the index, applies `edit` and writes the result, after any edit already running. */
  private mutate<T>(edit: (files: FileInfo[]) => IndexEdit<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const { files, result } = edit(await this.readIndex());
      await this.writeIndex(files);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async readIndex(): Promise<FileInfo[]> {
    if (!isTauri()) return [];
    const path = await indexPath(INDEX_FILE);
    if (!(await exists(path))) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readTextFile(path));
    } catch (error) {
      console.error("[storage] Recent files index is unreadable; starting fresh.", error);
      await this.setAsideIndex(path);
      return [];
    }
    return Array.isArray(parsed) ? uniqueFiles(parsed.filter(isFileInfo)) : [];
  }

  private async setAsideIndex(path: string): Promise<void> {
    try {
      await rename(path, await indexPath(CORRUPT_INDEX_FILE));
      this.indexReset = true;
    } catch (error) {
      console.error("[storage] Couldn't set the unreadable index aside.", error);
    }
  }

  private async writeIndex(files: FileInfo[]): Promise<void> {
    if (!isTauri()) throw new Error("Saving files is only available in the desktop app.");
    await mkdir(await appDataDir(), { recursive: true });
    const path = await indexPath(INDEX_FILE);
    await writeTextFile(`${path}.tmp`, JSON.stringify(files.slice(0, MAX_RECENTS), null, 2));
    await rename(`${path}.tmp`, path);
  }
}

function requireFileType(path: string): FileType {
  const type = fileTypeFromPath(path);
  if (!type) throw new Error(`Not a Cloudy Canvas file: ${path}`);
  return type;
}

/** Keeps the first (newest) entry for each id and each path. */
function uniqueFiles(files: FileInfo[]): FileInfo[] {
  const ids = new Set<string>();
  const paths = new Set<string>();
  return files.filter((file) => {
    if (ids.has(file.id) || paths.has(file.path)) return false;
    ids.add(file.id);
    paths.add(file.path);
    return true;
  });
}

async function indexPath(name: string): Promise<string> {
  return join(await appDataDir(), name);
}
