import type { CanvasDocument } from "@canvas";

import { isPage, type PageElement } from "./page";

/** The design's pages, in order: the user's, without the hidden ones a feature keeps. */
export function pagesOf(doc: CanvasDocument): PageElement[] {
  return allPagesOf(doc).filter((page) => !page.hidden);
}

/** Every page record, the user's first (in order), then the hidden ones (in order). */
export function allPagesOf(doc: CanvasDocument): PageElement[] {
  const pages = doc.all().filter(isPage);
  return [...pages.filter((page) => !page.hidden), ...pages.filter((page) => page.hidden)];
}
