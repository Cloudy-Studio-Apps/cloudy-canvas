import type { ElementView } from "@canvas";

import { drawPaints, type NodeGeometry } from "../core";
import type { RectangleElement } from "./rectangle.types";

/** The rectangle's fills and strokes over its (rounded) outline. */
export function drawRectangle(
  view: ElementView,
  el: RectangleElement,
  geometry: NodeGeometry,
): void {
  drawPaints(view, el, geometry);
}
