import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "@pages/shared/files";

export interface FileCardProps {
  file: FileInfo;
  kind: HomeFileKind;
  /** The file isn't where it was last seen. */
  missing: boolean;
  onOpen: (file: FileInfo) => void;
}
