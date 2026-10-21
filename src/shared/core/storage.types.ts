import type { FileInfo } from "./files.types";

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
  /** Removes a file from the recent files. The file itself is left alone. */
  forget(id: string): Promise<void>;
  /** Empties the recent files. The files themselves are left alone. */
  clear(): Promise<void>;
  /** Where the recent files list is kept, or `null` where it isn't a file (browser). */
  indexLocation(): Promise<string | null>;
  load(id: string): Promise<Uint8Array>;
  /** Writes `data` to `path` and records the file under `id`. */
  save(id: string, path: string, data: Uint8Array): Promise<FileInfo>;
  /**
   * True once after the recent files had to be reset because they couldn't be read
   * (the unreadable list is kept aside), so the UI can say so.
   */
  takeIndexReset(): boolean;
}
