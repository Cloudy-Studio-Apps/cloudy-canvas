import type { ProjectRecord } from "@shared/core";

export interface ProjectsState {
  projects: ProjectRecord[];
  /** Ids of projects whose folder no longer holds their `.cproject` (moved or deleted). */
  missing: ReadonlySet<string>;
  /** Re-reads the registry and checks which projects are missing. */
  refresh: () => Promise<void>;
  /** Records the project in `root` as opened and returns it. Throws when `root` isn't a project. */
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
   * The project `id`: where the registry says, else found by walking up from `nearFile` (the registry
   * is fixed silently). `null` when neither works.
   */
  resolve: (id: string, nearFile?: string) => Promise<ProjectRecord | null>;
}
