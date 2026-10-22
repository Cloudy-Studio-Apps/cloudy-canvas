import type { ElementView } from "@canvas";

import { drawPaints, traceBox } from "../core";
import type { RectangleElement } from "./rectangle.types";

/** The rectangle's fills and strokes over its (rounded) outline. */
export function drawRectangle(view: ElementView, el: RectangleElement): void {
  drawPaints(view, el, (g) => traceBox(g, el.w, el.h, el.cornerRadius));
}
