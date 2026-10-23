import type { CanvasElement, ElementKinds } from "@canvas";

import { DesignNodeKind } from "../node";
import { withDescendants } from "./tree-members";

/**
 * What the design doesn't draw on its own (`CanvasProduct.undrawn`): everything inside a node
 * that draws what it holds itself (a boolean draws its operands combined).
 */
export function treeUndrawn(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): ReadonlySet<string> {
  const drawers = new Set<string>();
  for (const el of elements) {
    const kind = kinds.kindOf(el);
    if (kind instanceof DesignNodeKind && !kind.drawsChildren) drawers.add(el.id);
  }
  if (drawers.size === 0) return drawers;
  const inside = withDescendants(drawers, elements);
  for (const id of drawers) inside.delete(id);
  return inside;
}
