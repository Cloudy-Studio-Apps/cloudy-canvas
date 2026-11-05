import type { CanvasDocument } from "@canvas";

import type { BrochureElement, BrochureSlot } from "../brochure";
import type { FrameElement } from "../../frame";
import { masterFramesOn } from "./masters/master-frames";
import { isPageFrame } from "./page-frame";
import { pageStarts } from "./page-starts";
import type { PlacedPage } from "./page-starts.types";
import { brochureExpansion } from "./repeats/brochure-expansion";
import { slotKey } from "./repeats/slot-key";
import type { BrochureExpansion, ExpandedPage } from "./repeats/expand-brochure.types";
import type { BrochurePage } from "./brochure-pages.types";

type Unnumbered = Omit<BrochurePage, "number" | "starts">;

/** The slot a pending page reads as: its template's, under the expanded page's id. */
function pendingSlot(page: ExpandedPage, template: BrochureSlot, frame: string): BrochureSlot {
  return {
    id: page.id,
    frames: [frame],
    chosen: frame,
    ...(template.master !== undefined ? { master: template.master } : {}),
    ...(template.skip ? { skip: template.skip } : {}),
    generated: { from: page.from, path: [...page.path] },
  };
}

/**
 * The brochure's pages, numbered, as its repeats expand them (`brochureExpansion`, or the one
 * given): template pages and the copies made, in the expansion's order, with a pending page for
 * each copy that prints but isn't made (it reads as its template page's frame), and a template
 * page whose list is empty for its row marked `notPrinted`. Copies kept out of the expansion (of
 * a list this device can't read) follow the slot before them. Frames that are gone (or are no
 * longer page frames of its design page, e.g. moved into another frame or to another page) are
 * skipped and slots left without any are too, so a stale id never shows. The frames of the
 * page's masters are never pages. Each page lists the sections starting on it (`pageStarts`).
 */
export function brochurePages(
  doc: CanvasDocument,
  brochure: BrochureElement,
  expansion: BrochureExpansion = brochureExpansion(doc, brochure),
): BrochurePage[] {
  const masters = masterFramesOn(doc, brochure.page);
  const framesOf = (
    slot: BrochureSlot,
  ): { frame: FrameElement; options: FrameElement[] } | null => {
    const options = slot.frames
      .map((id) => doc.get(id))
      .filter(isPageFrame)
      .filter((frame) => frame.pageId === brochure.page && !masters.has(frame.id));
    const frame = options.find((option) => option.id === slot.chosen) ?? options[0];
    return frame ? { frame, options } : null;
  };
  const bySlot = new Map<string, BrochureSlot>();
  for (const slot of brochure.slots)
    if (!bySlot.has(slotKey(slot))) bySlot.set(slotKey(slot), slot);

  const pages: { page: Unnumbered; order: number }[] = [];
  const used = new Set<string>();
  expansion.pages.forEach((item, order) => {
    const slot = bySlot.get(item.id);
    if (slot) {
      used.add(slot.id);
      const found = framesOf(slot);
      if (found)
        pages.push({
          page: { slot, ...found, ...(item.printed ? {} : { notPrinted: true }) },
          order,
        });
      return;
    }
    if (!item.printed) return;
    const template = bySlot.get(item.from);
    const found = template ? framesOf(template) : null;
    if (!template || !found) return;
    const pending = pendingSlot(item, template, found.frame.id);
    pages.push({
      page: { slot: pending, frame: found.frame, options: [found.frame], pending: item },
      order,
    });
  });

  brochure.slots.forEach((slot, i) => {
    if (used.has(slot.id)) return;
    used.add(slot.id);
    const found = framesOf(slot);
    if (!found) return;
    let at = 0;
    for (let j = i - 1; j >= 0 && at === 0; j--) {
      const before = brochure.slots[j]?.id;
      at = pages.findIndex((entry) => entry.page.slot.id === before) + 1;
    }
    const order = pages[at - 1]?.order ?? -1;
    pages.splice(at, 0, { page: { slot, ...found }, order });
  });

  const placed: PlacedPage[] = pages.map(({ page, order }) => ({
    order,
    slot: page.slot.id,
    printed: !page.notPrinted,
  }));
  const starts = pageStarts(brochure, expansion, placed);
  return pages.map(({ page }, i) => ({ ...page, number: i + 1, starts: starts[i] ?? [] }));
}
