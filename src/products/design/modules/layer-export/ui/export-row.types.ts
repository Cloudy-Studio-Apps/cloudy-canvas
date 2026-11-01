import type { NodeExport } from "../../core";

export interface ExportRowProps {
  row: NodeExport;
  onChange(row: NodeExport): void;
  onRemove(): void;
}
