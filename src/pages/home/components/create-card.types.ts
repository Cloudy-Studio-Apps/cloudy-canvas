import type { FileType } from "@shared/core";

export interface CreateCardProps {
  type: FileType;
  title: string;
  description: string;
  onSelect: () => void;
}
