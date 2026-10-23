import type { SizeLimits } from "../core";
import type { AxisItem, LayoutItem } from "./layout-frame.types";

/** The items seen along the direction (`p`) and across it (`c`). */
export function axisItems(items: readonly LayoutItem[], horizontal: boolean): AxisItem[] {
  return items.map((item) => {
    const w = limitsOf(item.limits, "W");
    const h = limitsOf(item.limits, "H");
    return horizontal
      ? { item, p: item.w, c: item.h, fillP: item.fillW, fillC: item.fillH, ...pc(w, h) }
      : { item, p: item.h, c: item.w, fillP: item.fillH, fillC: item.fillW, ...pc(h, w) };
  });
}

/** `n` kept within the limits. */
export function clampSize(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Shares `room` among the items that fill along the direction, equally, each kept within its
 * limits (an item held by one gives up its share to the others).
 */
export function shareRoom(fill: readonly AxisItem[], room: number): Map<AxisItem, number> {
  const sizes = new Map<AxisItem, number>();
  let free = [...fill];
  let left = room;
  while (free.length > 0) {
    const share = left / free.length;
    const held = free.filter((a) => clampSize(share, a.minP, a.maxP) !== share);
    if (held.length === 0) {
      for (const a of free) sizes.set(a, Math.max(0, share));
      break;
    }
    for (const a of held) {
      const size = Math.max(0, clampSize(share, a.minP, a.maxP));
      sizes.set(a, size);
      left -= size;
    }
    free = free.filter((a) => !held.includes(a));
  }
  return sizes;
}

function limitsOf(limits: SizeLimits | null, axis: "W" | "H"): { min: number; max: number } {
  return {
    min: limits?.[`min${axis}`] ?? 0,
    max: limits?.[`max${axis}`] ?? Infinity,
  };
}

function pc(
  p: { min: number; max: number },
  c: { min: number; max: number },
): Pick<AxisItem, "minP" | "maxP" | "minC" | "maxC"> {
  return { minP: p.min, maxP: p.max, minC: c.min, maxC: c.max };
}
