import type { CanvasElement, CopyContext } from "@canvas";

import { isDesignNode } from "../node";

/**
 * Copies keep their parent: a copied parent's copy (ids are remapped already), or the original
 * parent when it wasn't copied and is still there; otherwise the top of the page. They go on the
 * page on screen (their `pageId` is cleared, so adding them places them).
 */
export function prepareTreeCopies(copies: CanvasElement[], context: CopyContext): CanvasElement[] {
  const existing = new Set(context.existing.map((el) => el.id));
  return copies.map((el) => {
    if (!isDesignNode(el)) return el;
    const keepsParent =
      !el.parentId || context.copied.has(el.parentId) || existing.has(el.parentId);
    return { ...el, pageId: "", ...(keepsParent ? {} : { parentId: null }) };
  });
}
