import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "../file-kind.types";

export interface RecentFilesProps {
  files: FileInfo[];
  /** Ids of files that aren't where they were last seen. */
  missing: ReadonlySet<string>;
  kindOf: (file: FileInfo) => HomeFileKind;
  onOpen: (file: FileInfo) => void;
}
