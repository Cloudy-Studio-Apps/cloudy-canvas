import type { ProjectRecord } from "@shared/core";

export interface ProjectCardProps {
  project: ProjectRecord;
  /** Its folder no longer holds the project. */
  missing: boolean;
  onOpen: (project: ProjectRecord) => void;
  onLocate: (project: ProjectRecord) => void;
  onForget: (project: ProjectRecord) => void;
  onTogglePin: (project: ProjectRecord) => void;
}
