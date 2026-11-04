import type { CanvasDocument, CanvasElement, EditedChange } from "@canvas";

import { childrenByParent, isDesignNode } from "../../../core";
import type { BrochureElement } from "../../brochure";
import { bookLayout } from "../book-layout";
import { brochurePages } from "../brochure-pages";
import { brochuresOf } from "../design-brochures";
import { brochureLanguage } from "../language/document-texts";
import { pageNumbers } from "../numbering/page-numbers";
import { affectedPages } from "./affected-pages";
import { planPageItems } from "./plan-page-items";
import { stampTargets } from "./stamp-targets";
import { tableOfContents } from "./table-of-contents";

/**
 * A design page's brochures, the open one last (the one opened last, else its first, as
 * `current`), so it takes the frames it shares with another.
 */
function brochuresOn(records: readonly BrochureElement[], page: string): BrochureElement[] {
  const mine = records.filter((record) => record.page === page);
  let open: BrochureElement | null = null;
  for (const record of mine) {
    if (!open || (record.openedAt ?? 0) > (open.openedAt ?? 0)) open = record;
  }
  return open ? [...mine.filter((record) => record !== open), open] : [];
}

/**
 * The design's `afterEdit` hook, in the edit's undo step: on each design page the edit touched
 * (`affectedPages`), stamps every brochure's masters onto its pages and reads their page items
 * (`planPageItems`), writing only what differs, so its own writes, which run it again, end it.
 * A frame two brochures use shows the open one's.
 */
export function syncPageItems(doc: CanvasDocument, change: EditedChange): void {
  const records = brochuresOf(doc).records();
  if (records.length === 0) return;
  const pages = affectedPages(doc, change, records);
  if (pages.size === 0) return;
  const elements = doc.all();
  const children = childrenByParent(elements);

  for (const page of pages) {
    const byId = new Map<string, CanvasElement>();
    for (const el of elements) if (isDesignNode(el) && el.pageId === page) byId.set(el.id, el);
    const plan = planPageItems({
      brochures: brochuresOn(records, page).map((record) => {
        const layout = bookLayout(brochurePages(doc, record), record.settings);
        const numbers = pageNumbers(layout, record);
        // Today, written in the brochure's language.
        const date = new Intl.DateTimeFormat(brochureLanguage(record.settings), {
          dateStyle: "long",
        }).format(new Date());
        return {
          record,
          targets: stampTargets(doc, record, layout, numbers),
          context: {
            pages: numbers.filter((info) => info.counted).length,
            title: record.name,
            date,
            toc: tableOfContents(layout, numbers),
          },
        };
      }),
      byId,
      children,
    });
    for (const el of plan.add) doc.add(el);
    if (plan.update.size > 0) doc.updateMany(plan.update);
    if (plan.remove.length > 0) doc.remove(plan.remove);
  }
}
