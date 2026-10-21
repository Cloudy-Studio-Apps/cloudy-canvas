import type { FileInfo } from "@shared/core";

export interface RecentFilesProps {
  files: FileInfo[];
  onOpen: (file: FileInfo) => void;
}
