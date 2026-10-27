import type { FileInfo } from "@shared/core";
import type { HomeFileKind } from "../file-kind.types";
import type { CreateColumnProps } from "./create-column.types";

export interface ContinueSectionProps extends CreateColumnProps {
  /** The file shown big (`null` when every recent file is missing: only the create column shows). */
  hero: FileInfo | null;
  /** The recent files after it, the first few listed under it. */
  next: FileInfo[];
  kindOf: (file: FileInfo) => HomeFileKind;
  onOpen: (file: FileInfo) => void;
}
