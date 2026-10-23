import {
  elementBounds,
  unionRects,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
  type Rect,
} from "@canvas";

import { isDesignNode, type DesignNode } from "../node";

/** The selected nodes whose ancestors aren't selected, bottom to top. */
export function selectionRoots(
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): DesignNode[] {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const selectedAbove = (node: DesignNode): boolean => {
    for (let id = node.parentId, depth = 0; id && depth <= elements.length; depth++) {
      if (ids.has(id)) return true;
      const parent = byId.get(id);
      id = parent && isDesignNode(parent) ? parent.parentId : null;
    }
    return false;
  };
  return elements.filter(
    (el): el is DesignNode => ids.has(el.id) && isDesignNode(el) && !selectedAbove(el),
  );
}

/**
 * Puts nodes into a new host (a group, a boolean) made by `make` round their bounds, where the
 * topmost of them was, and returns its id. Call it in an undo step; `elements` are the scene's.
 */
export function wrapNodes(
  doc: CanvasDocument,
  nodes: readonly DesignNode[],
  kinds: ElementKinds,
  make: (rect: Rect, index: string, parentId: string | null) => DesignNode,
): string | null {
  const topmost = nodes[nodes.length - 1];
  if (!topmost) return null;
  const rect = unionRects(nodes.map((node) => elementBounds(kinds.kindOf(node), node)))!;
  const host = make(rect, topmost.index, topmost.parentId);
  doc.add(host);
  doc.updateMany(new Map(nodes.map((node) => [node.id, { parentId: host.id } as ElementPatch])));
  return host.id;
}
