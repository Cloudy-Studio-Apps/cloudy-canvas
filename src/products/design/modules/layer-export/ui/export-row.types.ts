import type { NodeExport } from "../../core";

export interface ExportRowProps {
  row: NodeExport;
  onChange(row: NodeExport): void;
  /** Left out, the row can't be removed. */
  onRemove?(): void;
}
