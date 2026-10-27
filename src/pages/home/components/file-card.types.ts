import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "../file-kind.types";

export interface FileCardProps {
  file: FileInfo;
  kind: HomeFileKind;
  /** The file isn't where it was last seen. */
  missing: boolean;
  onOpen: (file: FileInfo) => void;
}
