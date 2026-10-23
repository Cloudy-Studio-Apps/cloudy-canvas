import { pointAt } from "./bezier";
import type { CubicCurve, Extent } from "./path.types";

/** The axis-aligned box round the curve (exact: its ends and its extremes). */
export function curveExtent(curve: CubicCurve): Extent {
  const [p0, , , p3] = curve;
  const box = {
    minX: Math.min(p0.x, p3.x),
    minY: Math.min(p0.y, p3.y),
    maxX: Math.max(p0.x, p3.x),
    maxY: Math.max(p0.y, p3.y),
  };
  for (const t of [...extremes(curve, "x"), ...extremes(curve, "y")]) {
    const p = pointAt(curve, t);
    box.minX = Math.min(box.minX, p.x);
    box.minY = Math.min(box.minY, p.y);
    box.maxX = Math.max(box.maxX, p.x);
    box.maxY = Math.max(box.maxY, p.y);
  }
  return box;
}

/** Where the curve turns back along an axis: the roots of its derivative within (0, 1). */
function extremes([p0, p1, p2, p3]: CubicCurve, axis: "x" | "y"): number[] {
  const a = -p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis];
  const b = 2 * (p0[axis] - 2 * p1[axis] + p2[axis]);
  const c = p1[axis] - p0[axis];
  const inside = (t: number) => t > 0 && t < 1;
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-12 ? [] : [-c / b].filter(inside);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const root = Math.sqrt(disc);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)].filter(inside);
}
