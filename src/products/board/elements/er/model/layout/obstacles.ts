import type { Point, Rect } from "@canvas";

import { overlaps } from "./box";
import type { Obstacles } from "./layout.types";

/**
 * Whether a box can go here: it touches no placed box and no line, and its own line (from the
 * owner) crosses no other box or line.
 */
export function isFree(
  box: Rect,
  line: [Point, Point],
  obstacles: Obstacles,
  ownerBox: Rect,
): boolean {
  if (obstacles.rects.some((rect) => overlaps(rect, box))) return false;
  if (obstacles.segments.some(([a, b]) => segmentHitsRect(a, b, box))) return false;
  if (obstacles.segments.some(([a, b]) => segmentsCross(line[0], line[1], a, b))) return false;
  return !obstacles.rects.some(
    (rect) => !sameRect(rect, ownerBox) && segmentHitsRect(line[0], line[1], rect),
  );
}

/** Whether two segments cross at a point inside both (touching at an end doesn't count). */
export function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function cross(o: Point, p: Point, q: Point): number {
  return (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
}

/** Liang–Barsky: whether segment a→b passes through the rect. */
export function segmentHitsRect(a: Point, b: Point, rect: Rect): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, a.x - rect.x],
    [dx, rect.x + rect.w - a.x],
    [-dy, a.y - rect.y],
    [dy, rect.y + rect.h - a.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}

function sameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
