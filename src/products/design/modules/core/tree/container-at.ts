import {
  elementBounds,
  pointInRotatedRect,
  rectCenter,
  type CanvasElement,
  type ElementKinds,
} from "@canvas";

import { DesignNodeKind, isDesignNode } from "../node";

/**
 * The container `node` goes into: the topmost visible container (a frame, a section) whose
 * (turned) area holds its center and that it may go into (`canGoInto`), skipping the ids in `exclude` (a node
 * can't go into itself or what it holds). `elements` are bottom to top; `null` is the page.
 */
export function containerAt(
  node: CanvasElement,
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
  exclude: ReadonlySet<string> = new Set(),
): CanvasElement | null {
  const nodeKind = kinds.kindOf(node);
  const center = rectCenter(elementBounds(nodeKind, node));
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]!;
    if (exclude.has(el.id) || !isDesignNode(el) || !el.visible) continue;
    const kind = kinds.kindOf(el);
    if (!(kind instanceof DesignNodeKind) || !kind.container) continue;
    if (!pointInRotatedRect(center, kind.bounds(el), el.rotation ?? 0)) continue;
    if (nodeKind instanceof DesignNodeKind && !nodeKind.canGoInto(el, kind)) continue;
    return el;
  }
  return null;
}
