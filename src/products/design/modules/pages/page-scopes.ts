import type { CanvasScopes } from "@canvas";

import { isDesignNode } from "../core";
import { pagesOf } from "./pages-of";

/** The design's pages as the canvas's scopes: it shows one page's nodes at a time. */
export const PAGE_SCOPES: CanvasScopes = {
  list: (doc) => pagesOf(doc).map((page) => page.id),
  of: (el) => (isDesignNode(el) ? el.pageId : null),
  place: (el, scope) => (isDesignNode(el) && !el.pageId ? { ...el, pageId: scope } : el),
  label: (doc, scope) => pagesOf(doc).find((page) => page.id === scope)?.name ?? null,
};
