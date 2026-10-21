export type FileType = "board" | "design";

/** What a file says about itself (saved inside it), mirrored in the recent files. */
export interface FileMeta {
  /** Shown instead of the file name when set. */
  title?: string;
  description?: string;
}

export interface FileInfo extends FileMeta {
  id: string;
  name: string;
  type: FileType;
  /** Absolute path of the file on disk. */
  path: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
  formatVersion: number;
  /** Autosaved in the app data folder because no location was chosen yet (a board never saved). */
  draft?: boolean;
}
