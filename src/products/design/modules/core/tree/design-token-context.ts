import type { CanvasDocument, CanvasElement, ModeContext, TokenContext } from "@canvas";

import { isDesignNode } from "../node/is-design-node";
import { withDescendants } from "./tree-members";

/** The `variableModes` stored on an element (or a page record), if any. */
function storedModes(el: CanvasElement | undefined): Readonly<Record<string, string>> {
  return el?.variableModes ?? {};
}

/**
 * The design's modes: a layer uses its page's choice per collection, overridden by each frame
 * (or group, section) it's in from the outermost in, then by its own (Figma's inheritance).
 */
export const DESIGN_TOKEN_CONTEXT: TokenContext = {
  modesOf(doc: CanvasDocument, el: CanvasElement): ModeContext {
    const chain: CanvasElement[] = [];
    const seen = new Set<string>();
    let parentId = (el as { parentId?: string | null }).parentId ?? null;
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = doc.get(parentId);
      if (!parent) break;
      chain.push(parent);
      parentId = (parent as { parentId?: string | null }).parentId ?? null;
    }
    const pageId = (el as { pageId?: string }).pageId;
    const modes: Record<string, string> = { ...storedModes(pageId ? doc.get(pageId) : undefined) };
    for (const ancestor of chain.reverse()) Object.assign(modes, storedModes(ancestor));
    return Object.assign(modes, storedModes(el));
  },

  modeDependents(doc: CanvasDocument, ids: ReadonlySet<string>): Set<string> {
    const found = new Set<string>(ids);
    const nodes = new Set<string>();
    for (const id of ids) {
      const el = doc.get(id);
      // What isn't a layer but holds layers by their `pageId` is a page.
      if (el && !isDesignNode(el)) {
        for (const other of doc.ids()) if (doc.field(other, "pageId") === id) found.add(other);
      } else nodes.add(id);
    }
    if (nodes.size > 0) for (const id of withDescendants(nodes, doc.all())) found.add(id);
    return found;
  },
};
