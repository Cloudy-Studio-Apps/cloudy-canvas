/** A text file to write, its path relative to the folder it goes in. */
export interface ExportTextFile {
  path: string;
  content: string;
}

/** Asked with the files that already exist in the chosen folder; true replaces them. */
export type ConfirmOverwrite = (existing: string[]) => Promise<boolean>;
