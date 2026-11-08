import type { Point, Rect } from "@canvas";

/** The middle of a rect's right edge: where a link leaves a layer. */
export function rightMiddle(rect: Rect): Point {
  return { x: rect.x + rect.w, y: rect.y + rect.h / 2 };
}
