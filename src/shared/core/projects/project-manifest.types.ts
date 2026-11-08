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
  /**
   * The id this project had before it became its own: a copied folder opened while the original
   * was still where the registry says. Files of the copy that link the old id find it by this.
   */
  copiedFrom?: string;
}

/** A JSON object being read as (part of) a manifest, before its fields are checked. */
export type ManifestJson = Record<string, unknown>;
