import type { FileInfo } from "@shared/core";

export interface FileCardProps {
  file: FileInfo;
  /** The file isn't where it was last seen. */
  missing: boolean;
  onOpen: (file: FileInfo) => void;
}
