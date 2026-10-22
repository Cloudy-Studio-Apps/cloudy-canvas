import { rectContainsPoint, type CanvasElement, type ElementKinds, type Rect } from "@canvas";

import { DesignNodeKind, isDesignNode } from "../node";

/**
 * The topmost visible container (a frame) whose bounds hold the center of `rect`, skipping the ids
 * in `exclude` (a node can't go into itself or what it holds). `elements` are bottom to top.
 */
export function containerAt(
  rect: Rect,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  exclude: ReadonlySet<string> = new Set(),
): CanvasElement | null {
  const center = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]!;
    if (exclude.has(el.id) || !isDesignNode(el) || !el.visible) continue;
    const kind = kinds.kindOf(el);
    if (
      kind instanceof DesignNodeKind &&
      kind.container &&
      rectContainsPoint(kind.bounds(el), center)
    ) {
      return el;
    }
  }
  return null;
}
