import type { Point } from "../geometry.types";
import type { GradientTransform } from "./gradient.types";

/** The transform that leaves points where they are. */
export const IDENTITY_TRANSFORM: GradientTransform = [
  [1, 0, 0],
  [0, 1, 0],
];

/** `p` taken through `t`. */
export function applyAffine(t: GradientTransform, p: Point): Point {
  const [[a, c, e], [b, d, f]] = t;
  return { x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f };
}

/** `t` after `s`: the point goes through `s`, then `t`. */
export function multiplyAffine(t: GradientTransform, s: GradientTransform): GradientTransform {
  const [[a1, c1, e1], [b1, d1, f1]] = t;
  const [[a2, c2, e2], [b2, d2, f2]] = s;
  return [
    [a1 * a2 + c1 * b2, a1 * c2 + c1 * d2, a1 * e2 + c1 * f2 + e1],
    [b1 * a2 + d1 * b2, b1 * c2 + d1 * d2, b1 * e2 + d1 * f2 + f1],
  ];
}

/** The transform undoing `t`, or `null` when it flattens the plane (no inverse). */
export function invertAffine(t: GradientTransform): GradientTransform | null {
  const [[a, c, e], [b, d, f]] = t;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return null;
  return [
    [d / det, -c / det, (c * f - d * e) / det],
    [-b / det, a / det, (b * e - a * f) / det],
  ];
}

/** The transform taking `from[i]` to `to[i]` (three points each, not on one line). */
export function affineFromPoints(
  from: readonly [Point, Point, Point],
  to: readonly [Point, Point, Point],
): GradientTransform | null {
  const basis = (p: readonly [Point, Point, Point]): GradientTransform => [
    [p[1].x - p[0].x, p[2].x - p[0].x, p[0].x],
    [p[1].y - p[0].y, p[2].y - p[0].y, p[0].y],
  ];
  const fromInverse = invertAffine(basis(from));
  return fromInverse ? multiplyAffine(basis(to), fromInverse) : null;
}
