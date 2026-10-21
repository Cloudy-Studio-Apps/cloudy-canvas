import type { FileInfo } from "@core";

export interface RecentFilesProps {
  files: FileInfo[];
  onOpen: (file: FileInfo) => void;
}
