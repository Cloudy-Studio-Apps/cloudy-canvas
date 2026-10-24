import { brochurePageSize, fitsPage, unitsToMm } from "../model";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";

/** Why each kind of blank page was added, for its message. */
const BLANK_REASONS = {
  "back-cover": "so the back cover is on the left",
  "spread-start": "so the spread starts on a left page",
} as const;

/**
 * What the layout says about the pages: each blank page it added (to fill, or to move pages), and
 * printed frames that are neither one page nor a spread of the brochure's size.
 */
export function layoutIssues({ pages, layout }: BrochureCheckInput): BrochureIssue[] {
  const issues: BrochureIssue[] = [];
  for (const side of layout.sides) {
    if (side.kind !== "blank") continue;
    const page = pages.find((item) => item.slot.id === side.before);
    if (!page) continue;
    const label = layout.labels.get(page.slot.id) ?? String(page.number);
    issues.push({
      kind: "blank-page",
      page: label,
      frameId: page.frame.id,
      nodeId: page.frame.id,
      message: `A blank page goes before it ${BLANK_REASONS[side.reason]}.`,
    });
  }
  const size = brochurePageSize(pages);
  if (!size) return issues;
  const mm = (units: number) => Math.round(unitsToMm(units));
  for (const page of pages) {
    if (fitsPage(page.frame, size)) continue;
    issues.push({
      kind: "odd-size",
      page: layout.labels.get(page.slot.id) ?? String(page.number),
      frameId: page.frame.id,
      nodeId: page.frame.id,
      message: `It's ${mm(page.frame.w)} × ${mm(page.frame.h)} mm; the pages are ${mm(size.w)} × ${mm(size.h)} mm.`,
    });
  }
  return issues;
}
