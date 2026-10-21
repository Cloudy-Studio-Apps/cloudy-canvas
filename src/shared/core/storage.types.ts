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
  /** Records an existing file (e.g. picked in the open dialog), reusing its id when it's known. */
  register(path: string): Promise<FileInfo>;
  load(id: string): Promise<Uint8Array>;
  /** Writes `data` to `path` and records the file under `id`. */
  save(id: string, path: string, data: Uint8Array): Promise<FileInfo>;
}
