import type { Rect } from "../geometry.types";
import type { SnapAxis, SnapEdge, SnapTargets } from "./snap.types";

/** Values closer than this are the same line. */
export const SNAP_EPSILON = 0.01;

/** A box with its axes swapped, so code written for `x` handles `y` too. */
export function transpose({ x, y, w, h }: Rect): Rect {
  return { x: y, y: x, w: h, h: w };
}

/** A box seen along `axis`: as it is for `x`, transposed for `y`. */
export function along(rect: Rect, axis: SnapAxis): Rect {
  return axis === "x" ? rect : transpose(rect);
}

/** A box's start, center and end lines on `axis`. */
export function boxEdges(rect: Rect, axis: SnapAxis): SnapEdge[] {
  const { x, y, w, h } = along(rect, axis);
  return [
    { value: x, marks: [y, y + h] },
    { value: x + w / 2, marks: [y + h / 2] },
    { value: x + w, marks: [y, y + h] },
  ];
}

/**
 * The edges of these boxes, plus lines that aren't part of a box (ruler guides, without marks),
 * sorted for `nearestOffset` and `edgesAt`.
 */
export function snapTargets(
  boxes: Rect[],
  lines: Record<SnapAxis, number[]> = NO_LINES,
): SnapTargets {
  const sorted = (axis: SnapAxis) =>
    [
      ...boxes.flatMap((box) => boxEdges(box, axis)),
      ...lines[axis].map((value) => ({ value, marks: [] })),
    ].sort((a, b) => a.value - b.value);
  return { x: sorted("x"), y: sorted("y"), boxes };
}

const NO_LINES: Record<SnapAxis, number[]> = { x: [], y: [] };

/** Index of the first edge at or after `value` (binary search). */
function firstFrom(edges: readonly SnapEdge[], value: number): number {
  let lo = 0;
  let hi = edges.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (edges[mid]!.value < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * The smallest offset (within `threshold`) that puts one of the moving lines on an edge, or
 * `null` when none is that close.
 */
export function nearestOffset(
  moving: readonly number[],
  edges: readonly SnapEdge[],
  threshold: number,
): number | null {
  let best: number | null = null;
  for (const value of moving) {
    const i = firstFrom(edges, value);
    for (const edge of [edges[i - 1], edges[i]]) {
      if (!edge) continue;
      const offset = edge.value - value;
      if (Math.abs(offset) <= threshold && (best === null || Math.abs(offset) < Math.abs(best)))
        best = offset;
    }
  }
  return best;
}

/** The edges lying on `value`. */
export function edgesAt(edges: readonly SnapEdge[], value: number): SnapEdge[] {
  const found: SnapEdge[] = [];
  for (let i = firstFrom(edges, value - SNAP_EPSILON); i < edges.length; i++) {
    const edge = edges[i]!;
    if (edge.value > value + SNAP_EPSILON) break;
    found.push(edge);
  }
  return found;
}
