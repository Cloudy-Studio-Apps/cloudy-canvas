import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "@pages/shared/files";

export interface ContinueCardProps {
  /** The file opened last that's still there. */
  file: FileInfo;
  /** The next few recent files, listed under it as one-line links. */
  next: FileInfo[];
  kindOf: (file: FileInfo) => HomeFileKind;
  onOpen: (file: FileInfo) => void;
}
