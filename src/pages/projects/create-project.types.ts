import type { ImageFile } from "@shared/core";

/**
 * Where a new project's first library starts from: nothing, the styles of a `.cdesign`/`.cboard`
 * (its bytes), or a tokens JSON (its bytes).
 */
export type FirstLibrarySource =
  "empty" | { fromFile: Uint8Array } | { fromTokensJson: Uint8Array };

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
