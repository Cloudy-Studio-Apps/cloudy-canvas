import type { Point } from "@canvas";

import { CONNECTOR_DEFAULTS } from "./connector.defaults";

/**
 * Orthogonal route between two points. `dirA`/`dirB` are the outward directions of the sides the
 * ends leave from (`null` for free ends, which turn along the dominant axis).
 */
export function elbowRoute(a: Point, dirA: Point | null, b: Point, dirB: Point | null): Point[] {
  const { stub } = CONNECTOR_DEFAULTS;
  const da = dirA ?? dominantDirection(a, b);
  const db = dirB ?? dominantDirection(b, a);
  const horizontalA = da.x !== 0;
  const horizontalB = db.x !== 0;
  let route: Point[];

  if (horizontalA && horizontalB) {
    let x = (a.x + b.x) / 2;
    if (da.x > 0 && db.x > 0) x = Math.max(a.x, b.x) + stub;
    else if (da.x < 0 && db.x < 0) x = Math.min(a.x, b.x) - stub;
    else if (da.x * (b.x - a.x) < 0) x = a.x + da.x * stub; // Leaving away from the target.
    route = [a, { x, y: a.y }, { x, y: b.y }, b];
  } else if (!horizontalA && !horizontalB) {
    let y = (a.y + b.y) / 2;
    if (da.y > 0 && db.y > 0) y = Math.max(a.y, b.y) + stub;
    else if (da.y < 0 && db.y < 0) y = Math.min(a.y, b.y) - stub;
    else if (da.y * (b.y - a.y) < 0) y = a.y + da.y * stub;
    route = [a, { x: a.x, y }, { x: b.x, y }, b];
  } else if (horizontalA) {
    route = [a, { x: b.x, y: a.y }, b];
  } else {
    route = [a, { x: a.x, y: b.y }, b];
  }
  return simplify(route);
}

function dominantDirection(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.abs(dx) >= Math.abs(dy)
    ? { x: Math.sign(dx) || 1, y: 0 }
    : { x: 0, y: Math.sign(dy) || 1 };
}

/** Drops repeated and collinear points. */
function simplify(route: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of route) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - p.x) < 0.5 && Math.abs(last.y - p.y) < 0.5) continue;
    const prev = out[out.length - 2];
    if (prev && last && collinear(prev, last, p)) out.pop();
    out.push(p);
  }
  return out;
}

function collinear(a: Point, b: Point, c: Point): boolean {
  return (
    (Math.abs(a.x - b.x) < 0.5 && Math.abs(b.x - c.x) < 0.5) ||
    (Math.abs(a.y - b.y) < 0.5 && Math.abs(b.y - c.y) < 0.5)
  );
}
