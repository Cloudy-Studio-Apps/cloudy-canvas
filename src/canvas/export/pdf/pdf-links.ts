import { pdfNumber } from "./pdf-matrix";
import type { PdfLink } from "./pdf-links.types";

/** Where a link or a bookmark goes: the top of `page`, kept at the reader's zoom. */
export const pdfDestination = (pageRef: number) => `[${pageRef} 0 R /XYZ null null null]`;

/**
 * The `/Link` annotations of a page's links, with no border and no appearance, so they never
 * show or print. A link to a page the document doesn't have is left out.
 */
export function linkAnnotations(
  links: readonly PdfLink[],
  pageRef: (index: number) => number | null,
): string[] {
  return links.flatMap(({ box, page }) => {
    const ref = pageRef(page);
    if (ref === null) return [];
    const rect = box.map(pdfNumber).join(" ");
    return [
      `<< /Type /Annot /Subtype /Link /Rect [${rect}] /Border [0 0 0] ` +
        `/Dest ${pdfDestination(ref)} >>`,
    ];
  });
}
