import type { DesignNode, NodeExport } from "../../core";

export interface ExportAllState {
  open: boolean;
  /** What layers without export rows export as. */
  row: NodeExport;
  setOpen(open: boolean): void;
  setRow(row: NodeExport): void;
}

export type ExportAllScope = "page" | "all";

export interface ExportAllBodyProps {
  onClose(): void;
}

/** A page of the list. */
export interface ExportAllGroup {
  id: string;
  name: string;
  items: readonly DesignNode[];
}

export interface ExportAllListProps {
  groups: readonly ExportAllGroup[];
  /** Whether the groups' names show. */
  named: boolean;
  /** Layers ticked off. */
  skipped: ReadonlySet<string>;
  onToggle(id: string, on: boolean): void;
}
