// Framework-agnostic canvas engine: PixiJS renders, a Yjs doc (BoardDocument) holds the content.
// React only hosts it (mount/unmount) and draws UI around it; never import React or UI code here.
export { CanvasEngine, type CanvasEngineOptions, type EngineState } from "./canvas-engine";
export type { CanvasTheme } from "./render/renderer";
export type { ToolId, ToolOptions } from "./tools/types";
export { BoardDocument, MARKER_COLORS, MARKER_SIZES, STICKY_COLORS } from "./document";
export type { Shape, ShapeType } from "./document";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
