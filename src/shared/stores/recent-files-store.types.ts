import type { FileInfo } from "@shared/core";

export interface RecentFilesState {
  files: FileInfo[];
  /** Ids of recent files that aren't where they were last seen (moved or deleted). */
  missing: ReadonlySet<string>;
  /** Re-reads the recent files from storage and checks which ones are missing. */
  refresh: () => Promise<void>;
  /** Moves a just opened or saved file to the top. */
  upsert: (file: FileInfo) => void;
  /** Records the file at `path` as opened and returns it. Throws when it can't be opened. */
  open: (path: string) => Promise<FileInfo>;
  /** Asks where a missing file went and points it there. Returns `null` if the user cancels. */
  relocate: (id: string) => Promise<FileInfo | null>;
  /** Removes a file from the recent files (the file itself stays on disk). */
  forget: (id: string) => Promise<void>;
  /** Empties the recent files (the files themselves stay on disk). */
  clear: () => Promise<void>;
}
