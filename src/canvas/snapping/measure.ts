import { rectContainsRect } from "../geometry";
import type { Rect } from "../geometry.types";
import { along } from "./snap-edges";
import type { SnapAxis, SnapGap } from "./snap.types";

/**
 * The distances between the selection and another box (Alt + hover): from each side to the
 * other's inside when one holds the other, otherwise the space between them on each axis.
 */
export function measureGaps(selection: Rect, other: Rect): SnapGap[] {
  const inner = rectContainsRect(other, selection) ? selection : other;
  const outer = inner === selection ? other : selection;
  if (rectContainsRect(outer, inner))
    return (["x", "y"] as const).flatMap((axis) => insideGaps(axis, inner, outer));
  return (["x", "y"] as const).flatMap((axis) => {
    const gap = betweenGap(axis, selection, other);
    return gap ? [gap] : [];
  });
}

/** From `inner`'s two sides on `axis` to `outer`'s, at `inner`'s middle. */
function insideGaps(axis: SnapAxis, inner: Rect, outer: Rect): SnapGap[] {
  const i = along(inner, axis);
  const o = along(outer, axis);
  const cross = i.y + i.h / 2;
  return [
    { axis, from: o.x, to: i.x, cross },
    { axis, from: i.x + i.w, to: o.x + o.w, cross },
  ].filter((gap) => gap.to - gap.from > 0);
}

/** The space between two boxes on `axis`, at the middle of where they overlap (or `a`'s). */
function betweenGap(axis: SnapAxis, a: Rect, b: Rect): SnapGap | null {
  const p = along(a, axis);
  const q = along(b, axis);
  const [first, second] = p.x <= q.x ? [p, q] : [q, p];
  const from = first.x + first.w;
  if (second.x <= from) return null;
  const top = Math.max(p.y, q.y);
  const bottom = Math.min(p.y + p.h, q.y + q.h);
  const cross = top < bottom ? (top + bottom) / 2 : p.y + p.h / 2;
  return { axis, from, to: second.x, cross };
}
