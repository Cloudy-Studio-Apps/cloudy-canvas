import { unionRects, type CanvasElement, type Rect, type Size } from "@canvas";

import { isDesignNode } from "../core";

/** Space between a new preset frame and what's already on the page, in world units. */
const GAP = 100;

/**
 * Where a frame picked from the presets goes: to the right of the top-level layers, aligned with
 * their top, or at the origin on an empty page (Figma's behavior).
 */
export function presetFrameRect(size: Size, elements: readonly CanvasElement[]): Rect {
  const roots = elements.filter((el) => isDesignNode(el) && el.parentId === null);
  const content = unionRects(roots.map(({ x, y, w, h }) => ({ x, y, w, h })));
  if (!content) return { x: 0, y: 0, ...size };
  return { x: Math.round(content.x + content.w + GAP), y: Math.round(content.y), ...size };
}
