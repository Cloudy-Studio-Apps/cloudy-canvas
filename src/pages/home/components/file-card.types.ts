import type { FileInfo } from "@core";

export interface FileCardProps {
  file: FileInfo;
  onOpen: (file: FileInfo) => void;
}
