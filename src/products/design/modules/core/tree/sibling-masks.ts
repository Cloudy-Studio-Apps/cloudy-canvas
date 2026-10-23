import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../node";
import type { DesignNode } from "../node";

/**
 * Who masks each node directly, as in Figma: a visible mask masks the siblings above it in the
 * same parent, up to the next mask (which starts its own). A hidden mask masks nothing, and ends
 * the one below it. Returns masked node id → mask id; what the masked nodes hold is masked with
 * them (see the mask module's `designMasks`).
 */
export function siblingMasks(elements: readonly CanvasElement[]): Map<string, string> {
  const siblings = new Map<string | null, DesignNode[]>();
  for (const el of elements) {
    if (!isDesignNode(el)) continue;
    const list = siblings.get(el.parentId);
    if (list) list.push(el);
    else siblings.set(el.parentId, [el]);
  }
  const masked = new Map<string, string>();
  for (const list of siblings.values()) {
    if (!list.some((node) => node.isMask)) continue;
    list.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
    let mask: string | null = null;
    for (const node of list) {
      if (node.isMask) mask = node.visible ? node.id : null;
      else if (mask) masked.set(node.id, mask);
    }
  }
  return masked;
}

/** Whether a node is a mask that masks something (visible; what's above it doesn't matter). */
export function isActiveMask(el: CanvasElement): el is DesignNode {
  return isDesignNode(el) && el.isMask && el.visible;
}
