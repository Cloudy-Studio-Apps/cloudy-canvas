import type { CanvasElement } from "@canvas";
import { isDesignNode } from "@design";

/** How many colors "On this page" shows. */
const MAX_PAGE_COLORS = 18;

/** The distinct solid colors the page's nodes use (fills, then strokes), in drawing order. */
export function pageColors(elements: readonly CanvasElement[]): string[] {
  const colors = new Set<string>();
  for (const el of elements) {
    if (!isDesignNode(el)) continue;
    for (const paint of [...el.fills, ...el.strokes]) {
      if (paint.type === "solid") colors.add(paint.color.toLowerCase());
    }
  }
  return [...colors].slice(0, MAX_PAGE_COLORS);
}
