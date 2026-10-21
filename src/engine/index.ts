// Framework-agnostic canvas engine: PixiJS renders, a Yjs doc (BoardDocument) holds the content.
// React only hosts it (mount/unmount) and draws UI around it; never import React or UI code here.
export type { CanvasEngineOptions, HostActions } from "./canvas-engine.types";
export type { CommandId } from "./commands.types";
export type { EngineState } from "./engine-state.types";
export type { CanvasTheme } from "./render";
export type { ToolId, ToolOptions } from "./tools";
export type {
  ArrowHead,
  ConnectorStyle,
  DbColumn,
  DbRef,
  DbRefKind,
  DbTableShape,
  GeoKind,
  SectionShape,
  Shape,
  ShapeType,
} from "./document";
export type {
  ColumnTarget,
  DbApplyResult,
  DbColumnPatch,
  DbmlError,
  DbSchema,
  DbTablePatch,
  IncomingRef,
} from "./db";
export { CanvasEngine } from "./canvas-engine";
export { KEYMAP, shortcutLabel } from "./input";
export { TOOL_IDS } from "./tools";
export {
  BoardDocument,
  DB_HEADER_COLORS,
  GEO_KINDS,
  SECTION_COLORS,
  SHAPE_FILLS,
  SHAPE_STROKES,
  MARKER_COLORS,
  MARKER_SIZES,
  STICKY_COLORS,
} from "./document";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
