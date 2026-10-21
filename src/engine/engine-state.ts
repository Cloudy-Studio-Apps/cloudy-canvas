import { MARKER_COLORS, MARKER_SIZES, STICKY_COLORS } from "./document";
import type { ToolId, ToolOptions } from "./tools";

/** Snapshot for UI hosts (immutable; replaced on every change). */
export interface EngineState {
  tool: ToolId;
  options: ToolOptions;
  zoom: number;
  selectionCount: number;
  canUndo: boolean;
  canRedo: boolean;
}

export const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  markerColor: MARKER_COLORS[0].value,
  markerSize: MARKER_SIZES[1].value,
  stickyColor: STICKY_COLORS[0].value,
};
