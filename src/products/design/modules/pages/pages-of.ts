import type { CanvasDocument } from "@canvas";

import { isPage, type PageElement } from "./page";

/** The design's pages, in order. */
export function pagesOf(doc: CanvasDocument): PageElement[] {
  return doc.all().filter(isPage);
}
