import type { Point } from "@canvas";

import type { LineEnds, LineNodeElement } from "./line.types";

/** The bounds and local points of a line between two world points. */
export function lineFromEnds(
  start: Point,
  end: Point,
): Pick<LineNodeElement, "x" | "y" | "w" | "h" | "points"> {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  return {
    x,
    y,
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    points: [start.x - x, start.y - y, end.x - x, end.y - y],
  };
}

/** A line's ends in world coordinates. */
export function lineEnds(el: LineNodeElement): LineEnds {
  const [x0, y0, x1, y1] = el.points;
  return { start: { x: el.x + x0, y: el.y + y0 }, end: { x: el.x + x1, y: el.y + y1 } };
}

/** `to`, moved so the line from `from` runs at a multiple of 45° (Shift while drawing). */
export function snapTo45(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
  const length = Math.hypot(dx, dy);
  return {
    x: Math.round(from.x + Math.cos(angle) * length),
    y: Math.round(from.y + Math.sin(angle) * length),
  };
}
