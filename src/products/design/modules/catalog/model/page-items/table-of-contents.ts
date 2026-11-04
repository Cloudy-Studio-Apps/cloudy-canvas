import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "../numbering/page-numbers.types";

/** Between a line's name and its page number (text has no tab stops). */
const LEADER = "  ·  ";

/** Before a subsection's line, once per level it's down. */
const INDENT = "    ";

/**
 * The `{toc}` of a brochure: a line per section with its first page's number, in reading order,
 * subsections indented under theirs; a line per page (its frame's name) when it has no sections.
 * Unnumbered pages are left out.
 */
export function tableOfContents(layout: BookLayout, numbers: readonly PageInfo[]): string {
  const lines: string[] = [];
  const hasSections = numbers.some((info) => info.section !== null);
  const listed = new Set<string>();
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page" || side.part === "right") return;
    if (hasSections) {
      info.path.forEach((section, depth) => {
        if (listed.has(section.id)) return;
        listed.add(section.id);
        lines.push(`${INDENT.repeat(depth)}${section.name}${LEADER}${info.label}`);
      });
    } else if (info.label) {
      lines.push(`${side.page.frame.name}${LEADER}${info.label}`);
    }
  });
  return lines.join("\n");
}
