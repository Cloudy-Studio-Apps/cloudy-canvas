import type { CanvasDocument, CanvasElement } from "@canvas";

/**
 * A layer and its ancestors, innermost first, up to its top-level one; a cycle or a missing
 * parent (a broken tree) ends the walk.
 */
export function ancestorChain(doc: CanvasDocument, el: CanvasElement): CanvasElement[] {
  const chain: CanvasElement[] = [el];
  const visited = new Set([el.id]);
  for (let at = el; ;) {
    const parentId = doc.field(at.id, "parentId");
    if (typeof parentId !== "string" || visited.has(parentId)) break;
    const parent = doc.get(parentId);
    if (!parent) break;
    visited.add(parentId);
    chain.push(parent);
    at = parent;
  }
  return chain;
}
