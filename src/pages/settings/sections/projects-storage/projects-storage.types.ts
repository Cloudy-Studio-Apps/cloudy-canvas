import type { ProjectRecord, ProjectSizes } from "@shared/core";

export interface ProjectSizesState {
  /** Measured sizes by project id; a project not measured yet (or missing) has none. */
  sizes: ReadonlyMap<string, ProjectSizes>;
  /** Measures one project again, or all of them. */
  reload: (id?: string) => void;
}

export interface SpaceBarProps {
  sizes: ProjectSizes;
}

export interface ProjectsTableProps {
  projects: ProjectRecord[];
  sizes: ReadonlyMap<string, ProjectSizes>;
  onEmpty: (project: ProjectRecord) => void;
}
