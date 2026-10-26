import type { CanvasDocument } from "@canvas";

/** How deep a layer tree is followed up to its top-level node. */
const MAX_DEPTH = 256;

/**
 * The top-level node holding `id` (itself at the top), read from the document's `parentId`
 * fields without whole elements, so it works on any page; `null` for an id that isn't a node or
 * a broken parent chain.
 */
export function treeRootOf(doc: CanvasDocument, id: string): string | null {
  let current = id;
  // Bounded, so a broken parent chain can't loop forever.
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const parent = doc.field(current, "parentId");
    if (parent === null) return current;
    // Not a node, or gone.
    if (typeof parent !== "string") return null;
    current = parent;
  }
  return null;
}
