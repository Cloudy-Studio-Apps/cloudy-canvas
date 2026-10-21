import type { FileInfo } from "./files";

/**
 * Platform-agnostic persistence. Implemented per platform in `platform/`
 * (desktop: Tauri filesystem; later: web/IndexedDB, remote backend).
 */
export interface Storage {
  list(): Promise<FileInfo[]>;
  load(id: string): Promise<Uint8Array>;
  save(id: string, data: Uint8Array): Promise<void>;
}
