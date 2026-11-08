import type { ProjectRecord } from "@shared/core";
import type { ProjectCardProps } from "./project-card.types";

export interface ProjectGridProps extends Omit<ProjectCardProps, "project" | "missing"> {
  title: string;
  projects: ProjectRecord[];
  missing: ReadonlySet<string>;
}
