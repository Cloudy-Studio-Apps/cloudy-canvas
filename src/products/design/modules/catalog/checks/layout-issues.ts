import { brochurePageSize, fitsPage, unitsToMm } from "../model";
import type { BrochureCheckInput, BrochureIssue } from "./brochure-checks.types";
import { t } from "../catalog.i18n";

/** Why each kind of blank page was added, for its message. */
const BLANK_REASONS = {
  "back-cover": t("checks.layout.reasonBack"),
  "spread-start": t("checks.layout.reasonSpread"),
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
      message: t("checks.layout.blank", { reason: BLANK_REASONS[side.reason] }),
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
      message: t("checks.layout.oddSize", {
        w: mm(page.frame.w),
        h: mm(page.frame.h),
        pw: mm(size.w),
        ph: mm(size.h),
      }),
    });
  }
  return issues;
}
