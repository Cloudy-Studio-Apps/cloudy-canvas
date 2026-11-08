import type { ProjectEntry } from "@shared/core";
import type { FilesView } from "./files-toolbar.types";

export interface ProjectFileCardProps {
  entry: ProjectEntry;
  /** Where it is, shown under its name (search results and recent files). */
  where?: string;
  view?: FilesView;
}
