import type { Rect } from "../geometry.types";
import type { AxisSnap, SnapAxis, SnapGap } from "./snap.types";

/** Gaps this close count as equal (positions are rounded to whole units). */
const GAP_TOLERANCE = 0.5;

/**
 * Equal spacing on `x` (transpose the boxes for `y`): the offset that centers `box` between its
 * nearest neighbors on its row, or leaves it as far from one of them as two boxes of the row are
 * from each other, whichever is nearest within `threshold`.
 */
export function spacingSnap(box: Rect, boxes: readonly Rect[], threshold: number): AxisSnap | null {
  const row = rowOf(box, boxes);
  let left: Rect | undefined;
  let right: Rect | undefined;
  for (const b of row) {
    if (b.x + b.w <= box.x + threshold && (!left || b.x + b.w > left.x + left.w)) left = b;
    if (b.x >= box.x + box.w - threshold && (!right || b.x < right.x)) right = b;
  }

  const candidates: { x: number; gap: number }[] = [];
  if (left && right) {
    const gap = (right.x - (left.x + left.w) - box.w) / 2;
    if (gap >= 0) candidates.push({ x: left.x + left.w + gap, gap });
  }
  for (const gap of rowGaps(row)) {
    if (left) candidates.push({ x: left.x + left.w + gap, gap });
    if (right) candidates.push({ x: right.x - gap - box.w, gap });
  }

  let best: { x: number; gap: number } | null = null;
  for (const c of candidates) {
    const distance = Math.abs(c.x - box.x);
    if (distance <= threshold && (!best || distance < Math.abs(best.x - box.x))) best = c;
  }
  return best && { offset: best.x - box.x, gap: best.gap };
}

/**
 * The gaps of length `gap` on `box`'s row (where it ended up), between neighbors, to show the
 * equal spacing it snapped to. Boxes are along `x`; `axis` names the real one.
 */
export function spacingGaps(
  axis: SnapAxis,
  box: Rect,
  boxes: readonly Rect[],
  gap: number,
): SnapGap[] {
  const row = [...rowOf(box, boxes), box].sort((a, b) => a.x - b.x);
  const gaps: SnapGap[] = [];
  for (let i = 1; i < row.length; i++) {
    const a = row[i - 1]!;
    const b = row[i]!;
    if (Math.abs(b.x - (a.x + a.w) - gap) > GAP_TOLERANCE) continue;
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.h, b.y + b.h);
    gaps.push({ axis, from: a.x + a.w, to: b.x, cross: (top + bottom) / 2 });
  }
  return gaps;
}

/** The boxes beside `box`: they overlap it on the other axis. */
function rowOf(box: Rect, boxes: readonly Rect[]): Rect[] {
  return boxes.filter((b) => b.y < box.y + box.h && b.y + b.h > box.y);
}

/** The (positive) gaps between boxes next to each other on a row. */
function rowGaps(row: readonly Rect[]): number[] {
  const sorted = [...row].sort((a, b) => a.x - b.x);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!;
    const gap = sorted[i]!.x - (a.x + a.w);
    if (gap > GAP_TOLERANCE) gaps.push(gap);
  }
  return gaps;
}
