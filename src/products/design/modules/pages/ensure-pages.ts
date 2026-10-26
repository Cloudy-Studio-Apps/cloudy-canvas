import { generateKeyBetween } from "fractional-indexing";

import type { CanvasDocument, ElementPatch } from "@canvas";

import { isDesignNode, type DesignNode } from "../core";
import { createPage } from "./page";
import { allPagesOf, pagesOf } from "./pages-of";

/**
 * Every design has a page, and every node is on one: designs from before pages (and new ones)
 * get "Page 1", which takes the nodes that aren't on a page (a hidden page's nodes stay on it).
 * Not an undo step.
 */
export function ensurePages(doc: CanvasDocument): void {
  const pages = pagesOf(doc);
  let first = pages[0];
  if (!first) {
    first = createPage("Page 1", generateKeyBetween(null, null));
    doc.addUntracked(first);
  }
  const known = new Set(
    allPagesOf(doc)
      .map((page) => page.id)
      .concat(first.id),
  );
  const patch: ElementPatch<DesignNode> = { pageId: first.id };
  for (const el of doc.all()) {
    if (isDesignNode(el) && !known.has(el.pageId)) doc.updateUntracked(el.id, patch);
  }
}
