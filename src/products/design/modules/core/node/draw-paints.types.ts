import type { PathShape } from "@canvas";
import type { FillInput, Graphics } from "pixi.js";

import type { NodeStroke, StrokeShape } from "./design-node.types";
import type { Paint } from "./paint.types";

/** Paints what a paint covers into `g` with a style (a fill style, spread into strokes too). */
export type Trace = (g: Graphics, style: FillInput) => void;

/** How `drawPaints` draws strokes: a `NodeStroke`, or a hand-traced outline stroked centered. */
export type StrokeDrawing =
  | NodeStroke
  | { kind: "outline"; outline: (g: Graphics) => void; width: number; shape: StrokeShape };

/** One area a node fills with paints of its own (`drawRegionPaints`), in local coordinates. */
export interface PaintedShape {
  shape: PathShape;
  fills: readonly Paint[];
}
