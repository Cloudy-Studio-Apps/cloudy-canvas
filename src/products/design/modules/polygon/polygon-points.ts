import type { Point } from "@canvas";

import { pointsInBox } from "../core";
import type { PolygonElement } from "./polygon.types";

/** The polygon's corners in local coordinates, the first one at the top. */
export function polygonPoints(el: PolygonElement): Point[] {
  return pointsInBox(Math.max(3, Math.round(el.pointCount)), () => 1, el.w, el.h);
}
