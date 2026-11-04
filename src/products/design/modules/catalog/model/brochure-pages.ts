import type { CanvasDocument } from "@canvas";

import type { BrochureElement } from "../brochure";
import { masterFramesOn } from "./masters/master-frames";
import { isPageFrame } from "./page-frame";
import type { BrochurePage } from "./brochure-pages.types";

/**
 * The brochure's pages, numbered. Frames that are gone (or are no longer page frames of its design
 * page, e.g. moved into another frame or to another page) are skipped and slots left without any
 * are too, so a stale id never shows. The frames of the page's masters are never pages.
 */
export function brochurePages(doc: CanvasDocument, brochure: BrochureElement): BrochurePage[] {
  const masters = masterFramesOn(doc, brochure.page);
  const pages: BrochurePage[] = [];
  for (const slot of brochure.slots) {
    const options = slot.frames
      .map((id) => doc.get(id))
      .filter(isPageFrame)
      .filter((frame) => frame.pageId === brochure.page && !masters.has(frame.id));
    const frame = options.find((option) => option.id === slot.chosen) ?? options[0];
    if (frame) pages.push({ slot, number: pages.length + 1, frame, options });
  }
  return pages;
}
