import type { FirstLibrarySource } from "@pages/shared/projects";
import type { FileInfo, LibraryEntry, ProjectManifest, ProjectRecord } from "@shared/core";
import type { UseProject } from "../use-project.types";
import type { LibrarySummary } from "./library-summary.types";
import type { ProjectLibraryDocs } from "./use-project-library-docs.types";

/** What a new library starts from: a source of records, or a copy of another library. */
export type NewLibrarySource = FirstLibrarySource | { copyOf: string };

export interface NewLibraryInput {
  name: string;
  source: NewLibrarySource;
  /** New files, and files linked to "all" libraries, take it. */
  autoAdd: boolean;
}

/** What can be done with a project's libraries; failures are shown as toasts. */
export interface LibraryActions {
  /** Makes a library; returns its entry, or `null` when it failed. */
  create: (input: NewLibraryInput) => Promise<LibraryEntry | null>;
  rename: (library: LibrarySummary, name: string) => Promise<boolean>;
  /** Moves the library to the project's trash. */
  remove: (library: LibrarySummary) => Promise<void>;
  setAutoAdd: (library: LibrarySummary, autoAdd: boolean) => Promise<void>;
  /** Asks for pictures and SVGs and adds them to the library. */
  addAssets: (library: LibrarySummary) => Promise<void>;
  /** Asks for a design, board or tokens JSON and writes its variables and styles into the library. */
  importStyles: (library: LibrarySummary, kind: "file" | "tokens") => Promise<void>;
  /** Opens the project's newest file (or a new design) to edit the library's colors and styles. */
  editInFile: () => void;
  /** Puts a restored library file back in the manifest. */
  adoptRestored: (rel: string) => Promise<void>;
}

export interface LibraryActionsOptions {
  record: ProjectRecord;
  manifest: ProjectManifest;
  project: UseProject;
  libs: ProjectLibraryDocs;
  /** The project's newest files. */
  recent: FileInfo[];
  /** Files changed on disk (the trash too): reads again. */
  bump: () => void;
}
