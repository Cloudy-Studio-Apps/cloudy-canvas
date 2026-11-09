import type { ProjectLibrariesState } from "./use-project-libraries.types";

export interface ProjectMissingDialogProps {
  libraries: ProjectLibrariesState;
  /** The open file's name, as the top bar shows it. */
  fileName: string;
}
