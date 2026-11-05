import type { BrochurePage } from "../brochure-pages.types";

/**
 * The pages an arrange lays out on the canvas: the ones with frames of their own, pending pages
 * left out (they have none yet), and template pages that print nothing for their row kept in
 * line (they're still on the canvas).
 */
export function arrangedPages(pages: readonly BrochurePage[]): BrochurePage[] {
  return pages
    .filter((page) => !page.pending)
    .map((page) => (page.notPrinted ? { ...page, notPrinted: undefined } : page));
}
