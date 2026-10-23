import type { ElementView } from "@canvas";

import { drawPaints, type NodeGeometry, type NodeStroke } from "../core";
import type { RectangleElement } from "./rectangle.types";

/** The rectangle's fills and strokes over its (rounded) outline. */
export function drawRectangle(
  view: ElementView,
  el: RectangleElement,
  geometry: NodeGeometry,
  stroke: NodeStroke | null,
): void {
  drawPaints(view, el, geometry, stroke);
}
