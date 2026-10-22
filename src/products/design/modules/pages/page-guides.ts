import type { CanvasGuides, ElementPatch } from "@canvas";

import { isPage, type PageElement } from "./page";

/** The ruler guides of a design are kept on each page's record, so each page has its own. */
export const PAGE_GUIDES: CanvasGuides = {
  read: (doc, scope) => {
    const page = scope === null ? undefined : doc.get(scope);
    return page && isPage(page) ? (page.guides ?? []) : [];
  },
  write: (doc, scope, guides) => {
    const page = scope === null ? undefined : doc.get(scope);
    if (!page || !isPage(page)) return;
    const patch: ElementPatch<PageElement> = { guides: guides.map((guide) => ({ ...guide })) };
    doc.update(page.id, patch);
  },
};
