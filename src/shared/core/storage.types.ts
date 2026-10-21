import type { FileInfo, FileType } from "./files.types";

/**
 * Platform-agnostic persistence. Implemented per platform in `platform/`
 * (desktop: Tauri filesystem; later: web/IndexedDB, remote backend).
 * Files are addressed by a stable id; the platform keeps track of where each one lives.
 */
export interface Storage {
  /** Recently opened or saved files, newest first. */
  list(): Promise<FileInfo[]>;
  get(id: string): Promise<FileInfo | null>;
  /** Whether the file with this id is still where it was last seen. */
  exists(id: string): Promise<boolean>;
  /** Records an existing file (e.g. picked in the open dialog), reusing its id when it's known. */
  register(path: string): Promise<FileInfo>;
  /** Points a known file at its new location (it was moved), keeping its id. */
  relocate(id: string, path: string): Promise<FileInfo>;
  /** Removes a file from the recent files. The file itself is left alone, unless it's a draft. */
  forget(id: string): Promise<void>;
  /** Empties the recent files, except drafts. The files themselves are left alone. */
  clear(): Promise<void>;
  /** Where the recent files list is kept, or `null` where it isn't a file (browser). */
  indexLocation(): Promise<string | null>;
  load(id: string): Promise<Uint8Array>;
  /** Writes `data` to `path` and records the file under `id`. A draft saved elsewhere is removed. */
  save(id: string, path: string, data: Uint8Array): Promise<FileInfo>;
  /**
   * Autosaves a file that has no location yet as a draft kept by the app, recorded under `id`
   * with `name` (drafts are named by the app, not by their file).
   */
  saveDraft(id: string, name: string, type: FileType, data: Uint8Array): Promise<FileInfo>;
  /**
   * True once after the recent files had to be reset because they couldn't be read
   * (the unreadable list is kept aside), so the UI can say so.
   */
  takeIndexReset(): boolean;
}
