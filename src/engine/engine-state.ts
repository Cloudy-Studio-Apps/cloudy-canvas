import { MARKER_COLORS, MARKER_SIZES, SHAPE_FILLS, SHAPE_STROKES, STICKY_COLORS } from "./document";
import type { ToolOptions } from "./tools";

export const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  markerColor: MARKER_COLORS[0].value,
  markerSize: MARKER_SIZES[1].value,
  stickyColor: STICKY_COLORS[0].value,
  shapeKind: "rectangle",
  shapeFill: SHAPE_FILLS[0].value,
  shapeStroke: SHAPE_STROKES[0].value,
  connectorStyle: "elbow",
  connectorColor: MARKER_COLORS[0].value,
  connectorStartHead: "none",
  connectorEndHead: "arrow",
};
