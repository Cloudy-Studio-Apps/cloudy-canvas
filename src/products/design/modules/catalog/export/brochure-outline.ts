import type { PdfOutlineItem } from "@canvas";

import type { ContentsEntry } from "../model";
import type { OpenOutlineItem as OpenItem } from "./brochure-outline.types";

/**
 * The PDF's bookmarks: the table of contents' entries, each opening its PDF page (`pdfPages`, by
 * side), nested by depth (an entry goes under the last one before it that's less deep). Entries
 * on no page are left out, and theirs move up to the one before.
 */
export function brochureOutline(
  entries: readonly ContentsEntry[],
  pdfPages: readonly number[],
): PdfOutlineItem[] {
  const roots: OpenItem[] = [];
  const open: { depth: number; item: OpenItem }[] = [];
  for (const entry of entries) {
    const page = pdfPages[entry.side];
    if (page === undefined || page < 0) continue;
    const item: OpenItem = { title: entry.title, page, children: [] };
    while (open.length > 0 && open[open.length - 1]!.depth >= entry.depth) open.pop();
    const parent = open[open.length - 1];
    if (parent) parent.item.children.push(item);
    else roots.push(item);
    open.push({ depth: entry.depth, item });
  }
  return roots;
}
