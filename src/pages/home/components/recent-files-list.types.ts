import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "@pages/shared/files";

export interface RecentFilesListProps {
  files: FileInfo[];
  missing: ReadonlySet<string>;
  kindOf: (file: FileInfo) => HomeFileKind;
  onOpen: (file: FileInfo) => void;
}
