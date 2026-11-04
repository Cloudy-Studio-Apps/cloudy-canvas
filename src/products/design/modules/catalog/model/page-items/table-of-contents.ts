import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "../numbering/page-numbers.types";

/** Between a line's name and its page number (text has no tab stops). */
const LEADER = "  ·  ";

/**
 * The `{toc}` of a brochure: a line per section with its first page's number, in reading order;
 * a line per page (its frame's name) when it has no sections. Unnumbered pages are left out.
 */
export function tableOfContents(layout: BookLayout, numbers: readonly PageInfo[]): string {
  const lines: string[] = [];
  const hasSections = numbers.some((info) => info.section !== null);
  let section: PageInfo["section"] = null;
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page" || side.part === "right") return;
    if (hasSections) {
      if (info.section === section || !info.section) return;
      section = info.section;
      lines.push(`${section.name}${LEADER}${info.label}`);
    } else if (info.label) {
      lines.push(`${side.page.frame.name}${LEADER}${info.label}`);
    }
  });
  return lines.join("\n");
}
