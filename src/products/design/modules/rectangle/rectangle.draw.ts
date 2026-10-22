import type { Graphics } from "pixi.js";

import { drawPaints, traceBox } from "../core";
import type { RectangleElement } from "./rectangle.types";

/** The rectangle's fills and strokes over its (rounded) outline. */
export function drawRectangle(g: Graphics, el: RectangleElement): void {
  drawPaints(g, el, (path) => traceBox(path, el.w, el.h, el.cornerRadius));
}
