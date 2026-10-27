import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "../file-kind.types";

export interface RecentFilesListProps {
  files: FileInfo[];
  missing: ReadonlySet<string>;
  kindOf: (file: FileInfo) => HomeFileKind;
  onOpen: (file: FileInfo) => void;
}
