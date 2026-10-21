import type { BoardToolOptions } from "./board-options.types";
import { IMAGE_DEFAULTS } from "./elements/image";
import { STROKE_DEFAULTS } from "./elements/stroke";
import {
  HIGHLIGHTER_COLORS,
  HIGHLIGHTER_SIZES,
  LINE_COLORS,
  MARKER_COLORS,
  MARKER_SIZES,
  SECTION_COLORS,
  SHAPE_FILLS,
  SHAPE_STROKES,
  STICKY_COLORS,
  TABLE_COLORS,
} from "./palette";

/** The options a new board editor starts with. */
export const DEFAULT_BOARD_OPTIONS: BoardToolOptions = {
  drawPen: STROKE_DEFAULTS.pen,
  drawSmooth: false,
  markerColor: MARKER_COLORS[0].value,
  markerSize: MARKER_SIZES[1].value,
  highlighterColor: HIGHLIGHTER_COLORS[0].value,
  highlighterSize: HIGHLIGHTER_SIZES[1].value,
  stickyColor: STICKY_COLORS[0].value,
  shapeKind: "rectangle",
  shapeFill: SHAPE_FILLS[0].value,
  shapeStroke: SHAPE_STROKES[0].value,
  sectionColor: SECTION_COLORS[0].value,
  connectorStyle: "elbow",
  connectorColor: LINE_COLORS[0].value,
  connectorStartHead: "none",
  connectorEndHead: "arrow",
  dbKind: "table",
  imageBackground: IMAGE_DEFAULTS.background,
  imagePadding: IMAGE_DEFAULTS.padding,
  tableColor: TABLE_COLORS[0].value,
  tableHeader: true,
  sticker: null,
};
