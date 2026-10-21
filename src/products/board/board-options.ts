import type { BoardToolOptions } from "./board-options.types";
import {
  MARKER_COLORS,
  MARKER_SIZES,
  SECTION_COLORS,
  SHAPE_FILLS,
  SHAPE_STROKES,
  STICKY_COLORS,
} from "./palette";

/** The options a new board editor starts with. */
export const DEFAULT_BOARD_OPTIONS: BoardToolOptions = {
  markerColor: MARKER_COLORS[0].value,
  markerSize: MARKER_SIZES[1].value,
  stickyColor: STICKY_COLORS[0].value,
  shapeKind: "rectangle",
  shapeFill: SHAPE_FILLS[0].value,
  shapeStroke: SHAPE_STROKES[0].value,
  sectionColor: SECTION_COLORS[0].value,
  connectorStyle: "elbow",
  connectorColor: MARKER_COLORS[0].value,
  connectorStartHead: "none",
  connectorEndHead: "arrow",
  dbKind: "table",
};
