import type { FileInfo } from "@shared/core";

export interface RecentFilesProps {
  files: FileInfo[];
  /** Ids of files that aren't where they were last seen. */
  missing: ReadonlySet<string>;
  onOpen: (file: FileInfo) => void;
}
