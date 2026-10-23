import type { CanvasElement, ElementKinds } from "@canvas";

import { DesignNodeKind } from "../node";
import { childrenByParent, withDescendants } from "./tree-members";

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
  // What they hold, at any depth: a boolean nested in another is one of its operands.
  const children = childrenByParent(elements);
  const held = new Set([...drawers].flatMap((id) => children.get(id) ?? []));
  return withDescendants(held, elements);
}
