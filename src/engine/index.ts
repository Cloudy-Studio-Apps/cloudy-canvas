// Framework-agnostic canvas engine: PixiJS renders, a Yjs doc (BoardDocument) holds the content.
// React only hosts it (mount/unmount) and draws UI around it; never import React or UI code here.
export { CanvasEngine, type CanvasEngineOptions } from "./canvas-engine";
export type { EngineState } from "./engine-state";
export type { CommandId } from "./commands";
export { KEYMAP, shortcutLabel } from "./input";
export type { CanvasTheme } from "./render";
export { TOOL_IDS, type ToolId, type ToolOptions } from "./tools";
export { BoardDocument, MARKER_COLORS, MARKER_SIZES, STICKY_COLORS } from "./document";
export type { Shape, ShapeType } from "./document";
export { MIN_ZOOM, MAX_ZOOM } from "./camera";
