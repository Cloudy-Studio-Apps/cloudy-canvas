import type { CanvasElement, ElementKinds } from "@canvas";
import { DesignNodeKind, layoutOf, type DesignNode } from "@design";

/** Whether the node's parent is an auto layout frame. */
export function inAutoLayout(node: DesignNode, elements: readonly CanvasElement[]): boolean {
  if (!node.parentId) return false;
  return layoutOf(elements.find((el) => el.id === node.parentId)) !== null;
}

/** Whether the Resizing section shows: every layer can hug or is in an auto layout frame. */
export function showsSizing(
  nodes: readonly DesignNode[],
  kinds: ElementKinds,
  elements: readonly CanvasElement[],
): boolean {
  return (
    nodes.length > 0 &&
    nodes.every((node) => {
      const kind = kinds.kindOf(node);
      if (!(kind instanceof DesignNodeKind)) return false;
      return inAutoLayout(node, elements) || kind.canHug(node, "h") || kind.canHug(node, "v");
    })
  );
}
