import type { FileInfo } from "@shared/core";

export interface FileCardProps {
  file: FileInfo;
  onOpen: (file: FileInfo) => void;
}
