import type { CanvasDocument, CanvasElement, EditedChange } from "@canvas";
import { getLocale } from "@shared/core";

import { childrenByParent, isDesignNode } from "../../../core";
import type { BrochureElement } from "../../brochure";
import { bookLayout } from "../book-layout";
import { brochurePages } from "../brochure-pages";
import { brochuresOf } from "../design-brochures";
import { pageNumbers } from "../numbering/page-numbers";
import { affectedPages } from "./affected-pages";
import { planPageItems } from "./plan-page-items";
import { stampTargets } from "./stamp-targets";
import { tableOfContents } from "./table-of-contents";

/** A design page's open brochure: the one opened last, else its first (as `current`). */
function openOn(records: readonly BrochureElement[], page: string): BrochureElement | null {
  let open: BrochureElement | null = null;
  for (const record of records) {
    if (record.page !== page) continue;
    if (!open || (record.openedAt ?? 0) > (open.openedAt ?? 0)) open = record;
  }
  return open;
}

/**
 * The design's `afterEdit` hook, in the edit's undo step: on each design page the edit touched
 * (`affectedPages`), stamps the open brochure's masters onto its pages and reads its page items
 * (`planPageItems`), writing only what differs, so its own writes, which run it again, end it.
 * Only the open brochure of a page stamps; its copies leave the frames of the page's others.
 */
export function syncPageItems(doc: CanvasDocument, change: EditedChange): void {
  const records = brochuresOf(doc).records();
  if (records.length === 0) return;
  const pages = affectedPages(doc, change, records);
  if (pages.size === 0) return;
  const elements = doc.all();
  const children = childrenByParent(elements);
  const date = new Intl.DateTimeFormat(getLocale(), { dateStyle: "long" }).format(new Date());

  for (const page of pages) {
    const byId = new Map<string, CanvasElement>();
    for (const el of elements) if (isDesignNode(el) && el.pageId === page) byId.set(el.id, el);
    const record = openOn(records, page);
    const pageList = record ? brochurePages(doc, record) : [];
    const layout = bookLayout(pageList, record?.settings ?? { layout: "book", covers: "none" });
    const numbers = record ? pageNumbers(layout, record) : [];
    const plan = planPageItems({
      record,
      targets: record ? stampTargets(doc, record, layout, numbers) : [],
      context: {
        pages: numbers.filter((info) => info.counted).length,
        title: record?.name ?? "",
        date,
        toc: tableOfContents(layout, numbers),
      },
      byId,
      children,
    });
    for (const el of plan.add) doc.add(el);
    if (plan.update.size > 0) doc.updateMany(plan.update);
    if (plan.remove.length > 0) doc.remove(plan.remove);
  }
}
