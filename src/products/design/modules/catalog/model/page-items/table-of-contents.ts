import type { ContentsEntry } from "./contents-entries.types";

/** Between a line's name and its page number (text has no tab stops). */
const LEADER = "  ·  ";

/** Before a subsection's line, once per level it's down. */
const INDENT = "    ";

/** One entry's line of the `{toc}`. */
export const contentsLine = ({ title, depth, label }: ContentsEntry) =>
  `${INDENT.repeat(depth)}${title}${LEADER}${label}`;

/** The `{toc}` of a brochure: a line per entry (`contentsEntries`). */
export function tableOfContents(entries: readonly ContentsEntry[]): string {
  return entries.map(contentsLine).join("\n");
}
