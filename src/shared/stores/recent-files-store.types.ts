import type { FileInfo } from "@shared/core";

export interface RecentFilesState {
  files: FileInfo[];
  /** Re-reads the recent files from storage. */
  refresh: () => Promise<void>;
  /** Moves a just opened or saved file to the top. */
  upsert: (file: FileInfo) => void;
}
