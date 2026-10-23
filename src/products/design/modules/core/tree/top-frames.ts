import { elementBounds, readingOrder, type CanvasElement, type ElementKinds } from "@canvas";

import { DesignNodeKind } from "../node";
import type { DesignNode } from "../node";

/**
 * The frames N and Shift+N step through, as in Figma: the visible containers at the top of the
 * page (frames and sections), in reading order.
 */
export function topFrames(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): readonly CanvasElement[] {
  const frames = elements.flatMap((el) => {
    const kind = kinds.kindOf(el);
    const node = el as DesignNode;
    return kind instanceof DesignNodeKind && kind.container && !node.parentId && node.visible
      ? [{ el, rect: elementBounds(kind, el) }]
      : [];
  });
  return readingOrder(frames).map((frame) => frame.el);
}
