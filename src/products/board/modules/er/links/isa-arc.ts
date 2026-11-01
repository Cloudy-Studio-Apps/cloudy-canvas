import type { Point } from "@canvas";

import type { ErArc } from "./er-links.types";

/** How far below the triangle's tip the arc crosses the lines. */
const RADIUS = 26;
/** How far the arc goes past the outer lines, in radians. */
const OVERHANG = 0.22;
/** The least it reaches to each side of its middle, so a single line still gets a clear arc. */
const MIN_HALF_SPAN = 0.6;
const STRAIGHT_DOWN = Math.PI / 2;

/**
 * An exclusive hierarchy's arc: round the triangle's tip, across every line in `ends` however far
 * apart the children are.
 */
export function isaArc(apex: Point, ends: readonly Point[]): ErArc {
  const angles = ends.map((end) => Math.atan2(end.y - apex.y, end.x - apex.x));
  const low = angles.length > 0 ? Math.min(...angles) : STRAIGHT_DOWN;
  const high = angles.length > 0 ? Math.max(...angles) : STRAIGHT_DOWN;
  const middle = (low + high) / 2;
  const half = Math.max((high - low) / 2 + OVERHANG, MIN_HALF_SPAN);
  return {
    center: apex,
    radius: RADIUS,
    // It stays under the tip: above it, it would run into the triangle.
    from: Math.max(middle - half, 0),
    to: Math.min(middle + half, Math.PI),
  };
}
