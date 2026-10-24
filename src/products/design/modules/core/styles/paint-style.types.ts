import type { Paint } from "../node/paint.types";

/** What a paint style holds: a paint stack, as a node's fills or strokes. */
export interface PaintStyleValue {
  paints: Paint[];
}
