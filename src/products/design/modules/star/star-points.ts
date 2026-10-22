import type { Point } from "@canvas";

import { pointsInBox } from "../core";
import type { StarElement } from "./star.types";

/** The star's outer and inner corners in turn, in local coordinates, the first point at the top. */
export function starPoints(el: StarElement): Point[] {
  const count = Math.max(3, Math.round(el.pointCount));
  const inner = Math.min(1, Math.max(0.01, el.innerRadius));
  return pointsInBox(count * 2, (i) => (i % 2 === 0 ? 1 : inner), el.w, el.h);
}
