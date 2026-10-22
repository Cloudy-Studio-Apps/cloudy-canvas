import type { Point } from "../geometry.types";
import type { ArrangeItem, DistributeAxis } from "./arrange.types";

/**
 * How far each item moves so the spaces between them on `axis` are equal: ordered by position,
 * the first and the last stay put. Needs three items or more; positions stay whole units.
 */
export function distributeOffsets(
  items: readonly ArrangeItem[],
  axis: DistributeAxis,
): Map<string, Point> {
  const offsets = new Map<string, Point>();
  if (items.length < 3) return offsets;
  const start = (item: ArrangeItem) => (axis === "x" ? item.rect.x : item.rect.y);
  const size = (item: ArrangeItem) => (axis === "x" ? item.rect.w : item.rect.h);
  const sorted = [...items].sort((a, b) => start(a) - start(b) || size(a) - size(b));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const span = start(last) + size(last) - start(first);
  const total = sorted.reduce((sum, item) => sum + size(item), 0);
  const gap = (span - total) / (sorted.length - 1);

  let at = start(first);
  for (const item of sorted) {
    const delta = Math.round(at) - start(item);
    if (delta !== 0) offsets.set(item.id, axis === "x" ? { x: delta, y: 0 } : { x: 0, y: delta });
    at += size(item) + gap;
  }
  return offsets;
}
