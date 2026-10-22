// Freehand drawing: strokes, the marker (M) and the eraser (Shift+E). The module
// (`draw.module.ts`) registers them with the Draw panel.
export type * from "./stroke.types";
export type * from "./draw-options.types";
export { STROKE_DEFAULTS } from "./stroke.defaults";
export { createStroke } from "./stroke.factory";
export { StrokeKind } from "./stroke.kind";
export { strokeOutline } from "./stroke.outline";
export { EraserTool } from "./eraser.tool";
export { MarkerTool } from "./marker.tool";
