import type { CanvasDocument } from "@canvas";

import { isPage } from "./page";

/**
 * Which layers count as uses of a variable or a style: those on the user's pages, not on a page a
 * feature keeps (the design system's, whose layers show every token by design).
 */
export function countedUse(doc: CanvasDocument): (elementId: string) => boolean {
  return (id) => {
    const pageId = (doc.get(id) as { pageId?: string } | undefined)?.pageId;
    const page = pageId ? doc.get(pageId) : undefined;
    return !(page && isPage(page) && page.hidden === true);
  };
}
