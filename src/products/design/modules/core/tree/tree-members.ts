import type { CanvasElement } from "@canvas";

import { isDesignNode } from "../node";

/** The ids plus all their descendants: a node moves and is deleted with what it holds. */
export function withDescendants(
  ids: ReadonlySet<string>,
  elements: readonly CanvasElement[],
): Set<string> {
  const children = childrenByParent(elements);
  const all = new Set(ids);
  const queue = [...ids];
  for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
    for (const child of children.get(id) ?? []) {
      if (all.has(child)) continue;
      all.add(child);
      queue.push(child);
    }
  }
  return all;
}

/** Parent id → its children's ids, in element order. */
export function childrenByParent(elements: readonly CanvasElement[]): Map<string, string[]> {
  const children = new Map<string, string[]>();
  for (const el of elements) {
    if (!isDesignNode(el) || !el.parentId) continue;
    const list = children.get(el.parentId);
    if (list) list.push(el.id);
    else children.set(el.parentId, [el.id]);
  }
  return children;
}
