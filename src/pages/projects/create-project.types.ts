import type { ImageFile } from "@shared/core";
import type { FirstLibrarySource } from "@pages/shared/projects";

export interface CreateProjectInput {
  /** The project's name, also its `.cproject` file name. */
  name: string;
  /** `#rrggbb`. */
  color: string;
  icon: string | null;
  /** An image to copy into the project as its icon (replaces `icon`). */
  iconImage?: ImageFile | null;
  /** The project's folder itself (created if missing; an existing one keeps its files). */
  root: string;
  firstLibrary: FirstLibrarySource;
}
