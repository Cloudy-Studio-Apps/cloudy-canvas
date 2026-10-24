// The design's style types besides text styles (text's are in the text module): what each holds,
// how it's read back from the document and summed up, and where it's bound on a node.
export { EFFECT_STYLE, PAINT_STYLE, STROKE_STYLE, STROKE_STYLE_PATH } from "./style-paths";
export { effectStyleOfNode, effectStyleSummary, readEffectStyle } from "./effect-style";
export { paintStyleOfNode, paintStyleSummary, readPaintStyle } from "./paint-style";
export { readStrokeStyle, strokeStyleOfNode, strokeStyleSummary } from "./stroke-style";
export type { EffectStyleValue } from "./effect-style.types";
export type { PaintStyleValue } from "./paint-style.types";
export type { StrokeStyleValue } from "./stroke-style.types";
export { effectBindingsOf, paintBindingsOf, strokeBindingsOf } from "./style-bindings-of";
