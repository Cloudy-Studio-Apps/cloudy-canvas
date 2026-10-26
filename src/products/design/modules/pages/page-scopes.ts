import type { CanvasScopes } from "@canvas";

import { isDesignNode } from "../core";
import { isPage } from "./page";
import { allPagesOf } from "./pages-of";

/**
 * The design's pages as the canvas's scopes: it shows one page's nodes at a time. Hidden pages are
 * scopes too, in the background: only switching to them shows them.
 */
export const PAGE_SCOPES: CanvasScopes = {
  list: (doc) => allPagesOf(doc).map((page) => page.id),
  of: (el) => (isDesignNode(el) ? el.pageId : null),
  place: (el, scope) => (isDesignNode(el) && !el.pageId ? { ...el, pageId: scope } : el),
  label: (doc, scope) => allPagesOf(doc).find((page) => page.id === scope)?.name ?? null,
  background: (doc, scope) => {
    const el = doc.get(scope);
    return !!el && isPage(el) && el.hidden === true;
  },
};
