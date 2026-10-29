import type { CodeFile } from "../targets";

export interface CodeFileListProps {
  files: readonly CodeFile[];
  selected: string | null;
  onSelect: (path: string) => void;
}
