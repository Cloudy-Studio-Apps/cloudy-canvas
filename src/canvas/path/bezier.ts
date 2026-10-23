import type { Point } from "../geometry.types";
import type { CubicCurve } from "./path.types";

/** Samples used to find the nearest point of a curve before refining it. */
const SAMPLES = 24;
/** Steps a curve is flattened into for hit tests and bounds. */
const FLATTEN_STEPS = 16;

const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** The point of the curve at `t` (0–1). */
export function pointAt([p0, p1, p2, p3]: CubicCurve, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

/** The curve split at `t` into two curves that draw the same (de Casteljau). */
export function splitAt([p0, p1, p2, p3]: CubicCurve, t: number): [CubicCurve, CubicCurve] {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  const m = lerp(d, e, t);
  return [
    [p0, a, d, m],
    [m, e, c, p3],
  ];
}

/** The curve's points at even steps of `t` (both ends included). */
export function flatten(curve: CubicCurve, steps = FLATTEN_STEPS): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => pointAt(curve, i / steps));
}

/** The point of the curve nearest to `p`: sampled, then refined around the best sample. */
export function nearestT(curve: CubicCurve, p: Point): { t: number; distance: number } {
  const distanceAt = (t: number) => {
    const q = pointAt(curve, t);
    return Math.hypot(q.x - p.x, q.y - p.y);
  };
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const d = distanceAt(i / SAMPLES);
    if (d < bestDistance) {
      bestDistance = d;
      best = i / SAMPLES;
    }
  }
  for (let step = 1 / SAMPLES / 2; step > 1e-4; step /= 2) {
    for (const t of [best - step, best + step]) {
      if (t < 0 || t > 1) continue;
      const d = distanceAt(t);
      if (d < bestDistance) {
        bestDistance = d;
        best = t;
      }
    }
  }
  return { t: best, distance: bestDistance };
}

/**
 * The inner control points that make the curve pass through `target` at `t` (both moved by the
 * same amount, so the curve bends evenly; `t` is kept away from the ends).
 */
export function bendThrough(curve: CubicCurve, t: number, target: Point): [Point, Point] {
  const at = Math.min(0.9, Math.max(0.1, t));
  const current = pointAt(curve, at);
  const weight = 3 * at * (1 - at);
  const dx = (target.x - current.x) / weight;
  const dy = (target.y - current.y) / weight;
  return [
    { x: curve[1].x + dx, y: curve[1].y + dy },
    { x: curve[2].x + dx, y: curve[2].y + dy },
  ];
}

/** The same curve walked the other way. */
export function reverseCurve([p0, p1, p2, p3]: CubicCurve): CubicCurve {
  return [p3, p2, p1, p0];
}

/** The part of the curve between `t0` and `t1` (walked backwards when `t1` < `t0`). */
export function subCurve(curve: CubicCurve, t0: number, t1: number): CubicCurve {
  if (t1 < t0) return reverseCurve(subCurve(curve, t1, t0));
  if (t0 <= 0 && t1 >= 1) return curve;
  const [left] = t1 >= 1 ? [curve] : splitAt(curve, t1);
  if (t0 <= 0) return left;
  return splitAt(left, t0 / t1)[1];
}

/** How far the inner control points stray from the chord: 0 for a straight curve. */
export function flatness([p0, p1, p2, p3]: CubicCurve): number {
  return Math.max(distanceToLine(p1, p0, p3), distanceToLine(p2, p0, p3));
}

function distanceToLine(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-12) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / length;
}
