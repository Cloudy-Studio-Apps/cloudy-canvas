import type { Point } from "@canvas";

/** How far (screen px) the curve's ends bend out at least. */
const MIN_BEND = 30;

/** The curve of a link being dragged, from `start` to `end` (screen px), as SVG path data. */
export function dragPath(start: Point, end: Point): string {
  const k = Math.max(MIN_BEND, Math.abs(end.x - start.x) / 2);
  return `M ${start.x} ${start.y} C ${start.x + k} ${start.y}, ${end.x - k} ${end.y}, ${end.x} ${end.y}`;
}
