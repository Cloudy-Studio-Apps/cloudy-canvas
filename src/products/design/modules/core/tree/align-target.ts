import { elementBounds, type CanvasElement, type ElementKinds, type Rect } from "@canvas";

import { nearestContainer } from "./nearest-container";

/**
 * What one layer aligns with: where the nearest container (frame, section) it's in shows,
 * past any groups; `null` at the top of the page.
 */
export function containerAlignTarget(
  el: CanvasElement,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): Rect | null {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const container = nearestContainer(el, (id) => byId.get(id), kinds);
  return container && elementBounds(kinds.kindOf(container), container);
}
