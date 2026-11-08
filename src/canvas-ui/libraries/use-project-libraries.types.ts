import type { LibraryDocument } from "@canvas";
import type { ProjectRecord } from "@shared/core";
import type { LibraryHub } from "./library-hub";

/**
 * The open file's project libraries: `none` for a loose file (or a live guest's), `loading` while
 * the project is looked for, `ready` with its hub and the libraries the file uses, `missing` when
 * the project wasn't found (library items can't be edited until it's located).
 */
export interface ProjectLibrariesState {
  status: "none" | "loading" | "ready" | "missing";
  /** The project's id, from the file's link; `null` for a loose file. */
  projectId: string | null;
  project: ProjectRecord | null;
  hub: LibraryHub | null;
  /** The libraries the file uses, in the project's order (empty unless `ready`). */
  libraries: LibraryDocument[];
  /** Asks where the missing project is and opens it from there (errors are toasted). */
  locate: () => Promise<void>;
}

/** What looking for the project found, for the request (`<project id>:<attempt>`) that asked. */
export type FoundProject = { request: string } & (
  | { status: "missing"; project: null; hub: null }
  | { status: "ready"; project: ProjectRecord; hub: LibraryHub }
);
