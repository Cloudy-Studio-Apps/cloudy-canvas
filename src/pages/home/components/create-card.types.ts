import type { FileType } from "@core";

export interface CreateCardProps {
  type: FileType;
  title: string;
  description: string;
  onSelect: () => void;
}
