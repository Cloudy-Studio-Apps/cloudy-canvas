import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode } from "../../core";
import { isFrame, type FrameElement } from "../../frame";

/** Whether an element is a screen: a frame at the top of its design page. */
export function isScreen(el: CanvasElement | undefined): el is FrameElement {
  return isFrame(el) && el.parentId === null;
}

/** A design page's screens, in layer order (bottom to top). */
export function screensOf(doc: CanvasDocument, page: string): FrameElement[] {
  return doc.all().filter((el): el is FrameElement => isScreen(el) && el.pageId === page);
}

/** The screen a node is on (the node itself when it's one), or `null` when it's on none. */
export function screenOf(doc: CanvasDocument, id: string): FrameElement | null {
  const seen = new Set<string>();
  let el = doc.get(id);
  while (el && !seen.has(el.id)) {
    if (isScreen(el)) return el;
    if (!isDesignNode(el) || el.parentId === null) return null;
    seen.add(el.id);
    el = doc.get(el.parentId);
  }
  return null;
}
