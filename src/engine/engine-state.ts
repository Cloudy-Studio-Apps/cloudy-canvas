import { MARKER_COLORS, MARKER_SIZES, STICKY_COLORS } from "./document";
import type { ToolOptions } from "./tools";

export const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  markerColor: MARKER_COLORS[0].value,
  markerSize: MARKER_SIZES[1].value,
  stickyColor: STICKY_COLORS[0].value,
};
