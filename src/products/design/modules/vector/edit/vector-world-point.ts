import { rotatePoint, type Point } from "@canvas";

import type { VectorElement } from "../vector.types";

/** A point of the vector's network (local) in the world: mirrored in its box, then turned. */
export function vectorWorldPoint(el: VectorElement, p: Point): Point {
  const x = el.mirrored ? el.w - p.x : p.x;
  return rotatePoint({ x: el.x + x, y: el.y + p.y }, el, el.rotation ?? 0);
}
