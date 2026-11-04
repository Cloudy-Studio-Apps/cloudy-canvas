import type { PdfDocument } from "./pdf-document";
import { pdfDestination } from "./pdf-links";
import type { PdfOutlineItem } from "./pdf-outline.types";
import { pdfTextString } from "./pdf-text-string";

/** The items whose page exists, with their children kept the same way. */
function kept(
  items: readonly PdfOutlineItem[],
  pageRef: (index: number) => number | null,
): PdfOutlineItem[] {
  return items.flatMap((item) =>
    pageRef(item.page) === null ? [] : [{ ...item, children: kept(item.children, pageRef) }],
  );
}

/** How many items show under these ones, all open. */
const countOf = (items: readonly PdfOutlineItem[]): number =>
  items.reduce((sum, item) => sum + 1 + countOf(item.children), 0);

/**
 * Writes the outline (`/Outlines` and an object per bookmark, every level open) and returns its
 * number, `null` when there's nothing to list. Bookmarks to pages the document lacks are left out
 * with theirs.
 */
export function writeOutline(
  doc: PdfDocument,
  items: readonly PdfOutlineItem[],
  pageRef: (index: number) => number | null,
): number | null {
  const shown = kept(items, pageRef);
  if (shown.length === 0) return null;
  const root = doc.reserve();
  const [first, last] = writeLevel(doc, shown, root, pageRef);
  doc.fill(
    root,
    `<< /Type /Outlines /First ${first} 0 R /Last ${last} 0 R /Count ${countOf(shown)} >>`,
  );
  return root;
}

/** One level's items under `parent`; returns the first and last one's numbers. */
function writeLevel(
  doc: PdfDocument,
  items: readonly PdfOutlineItem[],
  parent: number,
  pageRef: (index: number) => number | null,
): [number, number] {
  const refs = items.map(() => doc.reserve());
  items.forEach((item, i) => {
    const ref = refs[i]!;
    const page = pageRef(item.page)!;
    const entries = [
      `/Title ${pdfTextString(item.title)}`,
      `/Parent ${parent} 0 R`,
      `/Dest ${pdfDestination(page)}`,
    ];
    const prev = refs[i - 1];
    const next = refs[i + 1];
    if (prev !== undefined) entries.push(`/Prev ${prev} 0 R`);
    if (next !== undefined) entries.push(`/Next ${next} 0 R`);
    if (item.children.length > 0) {
      const [first, last] = writeLevel(doc, item.children, ref, pageRef);
      entries.push(`/First ${first} 0 R /Last ${last} 0 R /Count ${countOf(item.children)}`);
    }
    doc.fill(ref, `<< ${entries.join(" ")} >>`);
  });
  return [refs[0]!, refs[refs.length - 1]!];
}
