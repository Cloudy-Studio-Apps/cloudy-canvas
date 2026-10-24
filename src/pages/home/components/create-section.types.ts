import type { FileType } from "@shared/core";

export interface CreateSectionProps {
  /** Creates a file of the type, opened in one of its modes when `mode` is given (a Catalog). */
  onCreate: (type: FileType, mode?: string) => void;
  onOpenFile: () => void;
}
