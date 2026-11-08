import { gradientKey, type CanvasElement, type Gradient } from "@canvas";
import { isDesignNode, isGradientPaint, nodePaintStacks } from "@design";

/** How many gradients "On this page" shows. */
const MAX_PAGE_GRADIENTS = 8;

/**
 * The distinct gradients the page's nodes use (fills, strokes, then vectors' areas' own fills), in
 * drawing order.
 */
export function pageGradients(elements: readonly CanvasElement[]): Gradient[] {
  const found = new Map<string, Gradient>();
  for (const el of elements) {
    if (!isDesignNode(el)) continue;
    for (const paint of nodePaintStacks(el).flatMap((stack) => stack.paints)) {
      if (!isGradientPaint(paint)) continue;
      const { type, stops, transform, interpolation } = paint;
      const gradient = { type, stops, transform, ...(interpolation ? { interpolation } : {}) };
      found.set(gradientKey(gradient), gradient);
      if (found.size >= MAX_PAGE_GRADIENTS) return [...found.values()];
    }
  }
  return [...found.values()];
}
