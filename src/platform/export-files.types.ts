/** A file to write, its path relative to the folder it goes in. */
export interface ExportedFile {
  path: string;
  content: string | Uint8Array;
}

/** Where several files go: into a chosen folder, or into one zip file. */
export type ExportDestination = "folder" | "zip";

export interface ExportFilesOptions {
  /** `folder` by default; the browser always downloads a zip. */
  as?: ExportDestination;
}

/** Asked with the files that already exist in the chosen folder; true replaces them. */
export type ConfirmOverwrite = (existing: string[]) => Promise<boolean>;
