import type { Point } from "../geometry.types";
import type { CubicCurve, PathSegment } from "./path.types";

/** A segment as the curve it draws from `from`. */
export function curveOf(from: Point, { c1, c2, to }: PathSegment): CubicCurve {
  return [from, c1, c2, to];
}

/** A straight segment to `to` (its control points on its ends). */
export function lineTo(from: Point, to: Point): PathSegment {
  return { c1: from, c2: to, to };
}

/** Whether a segment is straight (its control points on its ends). */
export function isLine(from: Point, { c1, c2, to }: PathSegment): boolean {
  return samePoint(c1, from) && samePoint(c2, to);
}

/** Whether two points are the same (within rounding). */
export function samePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
}
