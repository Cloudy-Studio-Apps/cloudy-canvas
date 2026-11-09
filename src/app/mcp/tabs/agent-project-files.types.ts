import type { FileType } from "@shared/core";

/** A board or design inside a project: its name without the extension, and its path. */
export interface ProjectFile {
  name: string;
  type: FileType;
  path: string;
}
