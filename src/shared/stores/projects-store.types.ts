import type { ProjectRecord } from "@shared/core";

export interface ProjectsState {
  projects: ProjectRecord[];
  /** Ids of projects whose folder no longer holds their `.cproject` (moved or deleted). */
  missing: ReadonlySet<string>;
  /** Re-reads the registry and checks which projects are missing. */
  refresh: () => Promise<void>;
  /**
   * Records the project in `root` as opened and returns it. A copy of a project the registry has
   * at another folder that still holds it becomes its own project (a new id, `copiedFrom` the
   * old one, and a toast). Throws when `root` isn't a project.
   */
  open: (root: string) => Promise<ProjectRecord>;
  /**
   * Asks where a missing project went and points it there. Returns `null` if the user cancels;
   * throws when the picked folder isn't that project.
   */
  locate: (id: string) => Promise<ProjectRecord | null>;
  setPinned: (id: string, pinned: boolean) => Promise<void>;
  /** Removes a project from the registry (its folder stays on disk). */
  forget: (id: string) => Promise<void>;
  /**
   * The project `id`: the nearest one above `nearFile` with that id (or a copy of it made its own,
   * `copiedFrom`: then the record has the copy's id and the caller links the file to it), else
   * where the registry says. The registry is fixed or filled silently; a copy found above the
   * file while the original is still in place becomes its own project, as with `open`. `null`
   * when neither works.
   */
  resolve: (id: string, nearFile?: string) => Promise<ProjectRecord | null>;
}
