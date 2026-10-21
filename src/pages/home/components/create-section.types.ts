import type { FileType } from "@shared/core";

export interface CreateSectionProps {
  onCreate: (type: FileType) => void;
  onOpenFile: () => void;
}
