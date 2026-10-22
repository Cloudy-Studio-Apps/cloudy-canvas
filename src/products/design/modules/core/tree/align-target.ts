import { elementBounds, type CanvasElement, type ElementKinds, type Rect } from "@canvas";

import { DesignNodeKind, isDesignNode } from "../node";

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
  let parentId = isDesignNode(el) ? el.parentId : null;
  while (parentId) {
    const parent = byId.get(parentId);
    if (!parent || !isDesignNode(parent)) return null;
    const kind = kinds.kindOf(parent);
    if (kind instanceof DesignNodeKind && kind.container) return elementBounds(kind, parent);
    parentId = parent.parentId;
  }
  return null;
}
