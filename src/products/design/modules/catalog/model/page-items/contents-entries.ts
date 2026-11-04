import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "../numbering/page-numbers.types";
import type { ContentsEntry } from "./contents-entries.types";

/**
 * What the table of contents lists, in reading order, and so the PDF's bookmarks: a line per
 * section with its first page, subsections a level down; a line per numbered page (its frame's
 * name) when the brochure has no sections.
 */
export function contentsEntries(layout: BookLayout, numbers: readonly PageInfo[]): ContentsEntry[] {
  const entries: ContentsEntry[] = [];
  const hasSections = numbers.some((info) => info.section !== null);
  const listed = new Set<string>();
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page" || side.part === "right") return;
    if (hasSections) {
      info.path.forEach((section, depth) => {
        if (listed.has(section.id)) return;
        listed.add(section.id);
        entries.push({ title: section.name, depth, label: info.label, side: i });
      });
    } else if (info.label) {
      entries.push({ title: side.page.frame.name, depth: 0, label: info.label, side: i });
    }
  });
  return entries;
}
