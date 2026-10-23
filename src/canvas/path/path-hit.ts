import type { Point } from "../geometry.types";
import { flatten } from "./bezier";
import type { PathShape } from "./path.types";
import { curveOf } from "./path-segments";

/** Steps each curve is flattened into for hit tests. */
const HIT_STEPS = 12;

/** Flattened contours, worked out once per shape object. */
const polygons = new WeakMap<PathShape, Point[][]>();

function polygonsOf(shape: PathShape): Point[][] {
  let known = polygons.get(shape);
  if (!known) {
    known = shape.contours.map((contour) => {
      const points = [contour.start];
      let from = contour.start;
      for (const segment of contour.segments) {
        points.push(...flatten(curveOf(from, segment), HIT_STEPS).slice(1));
        from = segment.to;
      }
      return points;
    });
    polygons.set(shape, known);
  }
  return known;
}

/** Whether a point is inside a normalized shape (even-odd across its contours: holes are out). */
export function pointInPath(shape: PathShape, p: Point): boolean {
  let inside = false;
  for (const polygon of polygonsOf(shape)) {
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i]!;
      const b = polygon[j]!;
      if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/** How far a point is from a shape's contours (for strokes). */
export function distanceToPath(shape: PathShape, p: Point): number {
  let best = Infinity;
  shape.contours.forEach((contour, index) => {
    const polygon = polygonsOf(shape)[index]!;
    const count = contour.closed ? polygon.length : polygon.length - 1;
    for (let i = 0; i < count; i++) {
      best = Math.min(best, distanceToSegment(p, polygon[i]!, polygon[(i + 1) % polygon.length]!));
    }
  });
  return best;
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const t =
    length > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length)) : 0;
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}
