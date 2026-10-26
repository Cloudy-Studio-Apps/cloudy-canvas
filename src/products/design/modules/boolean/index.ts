// Booleans (Union, Subtract, Intersect, Exclude): layers combined into one live shape, resolved
// from them on every change and drawn with the boolean's own paints. Also Flatten (Ctrl+E) and
// Outline stroke (Ctrl+Shift+O), which bake shapes and strokes into vectors.
export type * from "./boolean.types";
export {
  BOOLEAN_OPERATIONS,
  BOOLEAN_TYPE,
  booleanOperation,
  operationLabel,
} from "./boolean.constants";
export { createBoolean } from "./boolean.factory";
export { BooleanKind } from "./boolean.kind";
export { booleanNodes } from "./boolean-nodes";
export { flattenNodes } from "./flatten-nodes";
export { outlineStrokes } from "./outline-strokes";
export { booleanTools } from "./boolean.mcp";
