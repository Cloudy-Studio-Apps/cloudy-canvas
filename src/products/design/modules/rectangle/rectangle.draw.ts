import type { ElementView } from "@canvas";
import type { Graphics } from "pixi.js";

import { drawPaints, traceBox } from "../core";
import type { RectangleElement } from "./rectangle.types";

/** The rectangle's fills and strokes over its (rounded) outline. */
export function drawRectangle(view: ElementView, el: RectangleElement): void {
  drawPaints(view, el, rectangleOutline(el));
}

/** The rectangle's (rounded) outline, in local coordinates. */
export function rectangleOutline(el: RectangleElement): (g: Graphics) => void {
  return (g) => traceBox(g, el.w, el.h, el.cornerRadius);
}
