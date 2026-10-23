import type { FillInput, Graphics, StrokeInput } from "pixi.js";

/** How `drawPaints` fills or strokes what a node's shape covers (a geometry, or a hand trace). */
export interface PaintTracer {
  fill(g: Graphics, style: FillInput): void;
  stroke(g: Graphics, style: StrokeInput): void;
}
