import type { ImageFile } from "@shared/core";
import type { FirstLibrarySource } from "@pages/shared/projects";

export interface CreateProjectInput {
  /** Also the project's folder and `.cproject` file name. */
  name: string;
  /** `#rrggbb`. */
  color: string;
  icon: string | null;
  /** An image to copy into the project as its icon (replaces `icon`). */
  iconImage?: ImageFile | null;
  /** The folder the project's folder is created in. */
  parent: string;
  firstLibrary: FirstLibrarySource;
}
