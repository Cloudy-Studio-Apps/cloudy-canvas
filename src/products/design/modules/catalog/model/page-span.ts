import type { Size } from "@canvas";

import type { BrochurePage } from "./brochure-pages.types";

/** How far a frame may be off one or two pages' size and still count as them (a fraction). */
const SPAN_TOLERANCE = 0.02;

/**
 * The brochure's page size: the size most of its printed frames have, or half of it when that's a
 * spread of pages some other frames have (a brochure mostly made of spreads).
 */
export function brochurePageSize(pages: readonly BrochurePage[]): Size | null {
  const counts = new Map<string, { size: Size; count: number }>();
  for (const { frame } of pages) {
    const key = `${Math.round(frame.w)}x${Math.round(frame.h)}`;
    const found = counts.get(key);
    if (found) found.count++;
    else counts.set(key, { size: { w: frame.w, h: frame.h }, count: 1 });
  }
  let common: Size | null = null;
  let most = 0;
  for (const { size, count } of counts.values()) {
    if (count <= most) continue;
    common = size;
    most = count;
  }
  if (!common) return null;
  const half = { w: common.w / 2, h: common.h };
  const hasHalves = pages.some(({ frame }) => near(frame.w, half.w) && near(frame.h, half.h));
  return hasHalves ? half : common;
}

/** How many pages a frame holds: 2 when it's about twice the page's width at its height, else 1. */
export function spanOf(frame: Size, page: Size): 1 | 2 {
  return near(frame.w, page.w * 2) && near(frame.h, page.h) ? 2 : 1;
}

/** Whether a frame is one page or two of this size (else it prints at another size). */
export function fitsPage(frame: Size, page: Size): boolean {
  return near(frame.h, page.h) && (near(frame.w, page.w) || near(frame.w, page.w * 2));
}

function near(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(a, b) * SPAN_TOLERANCE;
}
