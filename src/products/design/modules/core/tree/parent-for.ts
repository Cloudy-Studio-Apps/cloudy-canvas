import { elementBounds, rectCenter, type CanvasElement, type ToolContext } from "@canvas";

import { containerAt } from "./container-at";

/**
 * The container a node a tool is placing goes into (see `containerAt`; `null`: the top of the
 * page), never one of `exclude` (the node itself).
 */
export function parentFor(
  ctx: ToolContext,
  node: CanvasElement,
  exclude: ReadonlySet<string> = new Set(),
): string | null {
  const center = rectCenter(elementBounds(ctx.kinds.kindOf(node), node));
  const under = ctx.elementsInRect({ ...center, w: 0, h: 0 });
  return containerAt(node, under, ctx.kinds, exclude)?.id ?? null;
}
