import type { Rect, ToolContext } from "@canvas";

import { containerAt } from "./container-at";

/**
 * The frame a node with these bounds goes into: the topmost container under its center (`null`:
 * the top of the page), never one of `exclude` (the node itself). For tools placing new nodes.
 */
export function parentFor(
  ctx: ToolContext,
  bounds: Rect,
  exclude: ReadonlySet<string> = new Set(),
): string | null {
  const probe = { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2, w: 0, h: 0 };
  return containerAt(bounds, ctx.elementsInRect(probe), ctx.kinds, exclude)?.id ?? null;
}
