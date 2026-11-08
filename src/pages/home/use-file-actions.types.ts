import type { FileInfo } from "@shared/core";
import type { FileAction } from "@pages/shared/files";

export type { FileAction };

export interface FileActionsOptions {
  file: FileInfo;
  /** The file isn't where it was last seen: offer to locate it instead of opening it. */
  missing: boolean;
  onOpen: (file: FileInfo) => void;
}
