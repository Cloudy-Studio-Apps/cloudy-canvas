export type FileType = "board" | "design";

export interface FileInfo {
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
}
