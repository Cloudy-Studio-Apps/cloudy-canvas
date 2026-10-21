import type { ToolId, ToolOptions } from "./tools";

/** Snapshot for UI hosts (immutable; replaced on every change). */
export interface EngineState {
  tool: ToolId;
  options: ToolOptions;
  zoom: number;
  selectionCount: number;
  /** Sorted, comma-separated types of the selected elements, e.g. "geo,sticky". */
  selectionTypes: string;
  canUndo: boolean;
  canRedo: boolean;
}
