import type { CanvasDocument } from "@canvas";

import type { BrochureElement } from "../brochure";
import { isPageFrame } from "./page-frame";
import type { BrochurePage } from "./brochure-pages.types";

/**
 * The brochure's pages, numbered. Frames that are gone (or are no longer page frames of its design
 * page, e.g. moved into another frame or to another page) are skipped and slots left without any
 * are too, so a stale id never shows.
 */
export function brochurePages(doc: CanvasDocument, brochure: BrochureElement): BrochurePage[] {
  const pages: BrochurePage[] = [];
  for (const slot of brochure.slots) {
    const options = slot.frames
      .map((id) => doc.get(id))
      .filter(isPageFrame)
      .filter((frame) => frame.pageId === brochure.page);
    const frame = options.find((option) => option.id === slot.chosen) ?? options[0];
    if (frame) pages.push({ slot, number: pages.length + 1, frame, options });
  }
  return pages;
}
