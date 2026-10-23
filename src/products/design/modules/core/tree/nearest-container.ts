import { rotatePoint, type CanvasElement, type ElementKinds, type Point } from "@canvas";

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
 * A layer's X and Y, as in Figma: from the top-left corner of the container it's in, or from the
 * page's origin at the top of the page or in a turned container (whose axes aren't the page's).
 * In a mirrored container they're in its mirrored space: X counts from its right edge to the
 * corner the layer's box shows there (its far side's).
 */
export function layerPosition(
  el: CanvasElement,
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): Point {
  const container = nearestContainer(el, get, kinds);
  if (!container || container.rotation) return { x: el.x, y: el.y };
  if (!container.mirrored) return { x: el.x - container.x, y: el.y - container.y };
  const far = farCorner(el);
  return { x: container.x + container.w - far.x, y: far.y - container.y };
}

/** The move that puts a layer at `value` on `axis` of its `layerPosition`, on whole units. */
export function positionMove(
  el: CanvasElement,
  axis: "x" | "y",
  value: number,
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): { dx: number; dy: number } {
  const container = nearestContainer(el, get, kinds);
  const turned = !container || Boolean(container.rotation);
  const origin = turned ? { x: 0, y: 0 } : { x: container.x, y: container.y };
  if (turned || !container.mirrored) {
    const d = Math.round(value + origin[axis]) - el[axis];
    return axis === "x" ? { dx: d, dy: 0 } : { dx: 0, dy: d };
  }
  const far = farCorner(el);
  if (axis === "y") return { dx: 0, dy: Math.round(value + origin.y) - far.y };
  return { dx: Math.round(origin.x + container.w - value) - far.x, dy: 0 };
}

/** The corner at the far end of a layer's top side (its right one, unturned). */
function farCorner(el: CanvasElement): Point {
  return rotatePoint({ x: el.x + el.w, y: el.y }, el, el.rotation ?? 0);
}
