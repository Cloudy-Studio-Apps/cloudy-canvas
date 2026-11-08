import type { CanvasElement } from "@canvas";
import { isDesignNode, nodePaintStacks } from "@design";

/** How many colors "On this page" shows. */
const MAX_PAGE_COLORS = 18;

/**
 * The distinct solid colors the page's nodes use (fills, strokes, then vectors' areas' own fills),
 * in drawing order.
 */
export function pageColors(elements: readonly CanvasElement[]): string[] {
  const colors = new Set<string>();
  for (const el of elements) {
    if (!isDesignNode(el)) continue;
    for (const { paints } of nodePaintStacks(el)) {
      for (const paint of paints) {
        if (paint.type === "solid") colors.add(paint.color.toLowerCase());
      }
    }
  }
  return [...colors].slice(0, MAX_PAGE_COLORS);
}
