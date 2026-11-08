import type { ProjectEntry } from "@shared/core";

export interface ProjectFileCardProps {
  entry: ProjectEntry;
  /** Where it is, shown under its name (search results and recent files). */
  where?: string;
  view?: "grid" | "list";
}
