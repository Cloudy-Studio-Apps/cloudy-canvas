export type ProjectCover = { kind: "colors" } | { kind: "image"; file: string };

export interface FolderStyle {
  color?: string;
}

export interface LibraryEntry {
  id: string;
  name: string;
  /** File name in `.cloudy/libraries`. */
  file: string;
  /** Fractional index among the project's libraries. */
  order: string;
  /** New files and the "all" scope use it. */
  autoAdd: boolean;
}

export interface ProjectManifest {
  format: 1;
  id: string;
  name: string;
  color: string;
  icon: string | null;
  cover: ProjectCover | null;
  libraries: LibraryEntry[];
  /** Folder path relative to the root (`/`-separated) to its style. */
  folders: Record<string, FolderStyle>;
}
