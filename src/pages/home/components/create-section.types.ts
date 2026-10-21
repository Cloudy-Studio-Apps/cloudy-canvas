import type { FileType } from "@core";

export interface CreateSectionProps {
  onCreate: (type: FileType) => void;
  onOpenFile: () => void;
}
