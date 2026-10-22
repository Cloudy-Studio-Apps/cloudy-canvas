import type { CanvasElement, ElementKinds, Point } from "@canvas";

import { DesignNodeKind, isDesignNode, type DesignNode } from "../node";

/** The nearest container (frame, section) a layer is in, past any groups; `null` at the top. */
export function nearestContainer(
  el: CanvasElement,
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): DesignNode | null {
  let parentId = isDesignNode(el) ? el.parentId : null;
  while (parentId) {
    const parent = get(parentId);
    if (!parent || !isDesignNode(parent)) return null;
    const kind = kinds.kindOf(parent);
    if (kind instanceof DesignNodeKind && kind.container) return parent;
    parentId = parent.parentId;
  }
  return null;
}

/**
 * Where a layer's X and Y count from, as in Figma: the top-left corner of the container it's in,
 * or the page's origin at the top of the page or in a turned container (whose axes aren't the
 * page's).
 */
export function positionOrigin(
  el: CanvasElement,
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): Point {
  const container = nearestContainer(el, get, kinds);
  return container && !container.rotation ? { x: container.x, y: container.y } : { x: 0, y: 0 };
}
