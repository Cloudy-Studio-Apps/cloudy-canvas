import type { ToolId, ToolOptions } from "./tools";

/** Snapshot for UI hosts (immutable; replaced on every change). */
export interface EngineState {
  tool: ToolId;
  options: ToolOptions;
  zoom: number;
  selectionCount: number;
  /** The selected database table, when exactly one is selected. */
  selectedTableId: string | null;
  canUndo: boolean;
  canRedo: boolean;
}
