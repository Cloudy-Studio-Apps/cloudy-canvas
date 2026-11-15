import type { CanvasElement } from "@canvas";

import { childrenByParent, isDesignNode, type DesignNode } from "../../core";

/**
 * Each element list's layers by id and children by parent, read once: the checks ask for every
 * page's layers from the same list, and reading the whole document for each was most of their time.
 */
const trees = new WeakMap<
  readonly CanvasElement[],
  { byId: Map<string, DesignNode>; order: Map<string, number>; children: Map<string, string[]> }
>();

/** The visible layers inside a frame (a hidden one hides what it holds). */
export function shownNodes(frameId: string, elements: readonly CanvasElement[]): DesignNode[] {
  let tree = trees.get(elements);
  if (!tree) {
    const nodes = elements.filter(isDesignNode);
    tree = {
      byId: new Map(nodes.map((node) => [node.id, node])),
      order: new Map(nodes.map((node, i) => [node.id, i])),
      children: childrenByParent(nodes),
    };
    trees.set(elements, tree);
  }
  const { byId, order, children } = tree;
  if (!byId.get(frameId)?.visible) return [];
  const shown: DesignNode[] = [];
  const queue = [...(children.get(frameId) ?? [])];
  for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
    const node = byId.get(id);
    // A hidden layer is left out with all it holds.
    if (!node?.visible) continue;
    shown.push(node);
    queue.push(...(children.get(id) ?? []));
  }
  // In the document's order, as the issues are listed.
  return shown.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
