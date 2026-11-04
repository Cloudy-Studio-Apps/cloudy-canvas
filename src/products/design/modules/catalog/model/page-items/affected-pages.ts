import type { CanvasDocument, CanvasElement, EditedChange } from "@canvas";

import { isBrochure, type BrochureElement } from "../../brochure";
import { isDesignNode } from "../../../core";
import { framesOfMaster } from "../masters/master-frames";
import { pageItemTag, pageItemTemplate } from "./page-item-fields";

/** The top-level layer `el` is in (itself when it's one). */
function topOf(doc: CanvasDocument, el: CanvasElement): CanvasElement {
  let top = el;
  for (let depth = 0; depth < 64 && isDesignNode(top) && top.parentId; depth++) {
    const parent = doc.get(top.parentId);
    if (!parent) break;
    top = parent;
  }
  return top;
}

/**
 * The design pages an edit may change the master copies or page items of: a brochure's, one of
 * whose pages or masters (or what they hold) changed, or where a copy or a page item was edited
 * or removed. Empty for every other edit, which then costs one look at each changed layer.
 */
export function affectedPages(
  doc: CanvasDocument,
  change: EditedChange,
  records: readonly BrochureElement[],
): Set<string> {
  const owner = new Map<string, string>();
  for (const record of records) {
    for (const slot of record.slots) for (const frame of slot.frames) owner.set(frame, record.page);
    for (const master of record.masters) {
      for (const frame of framesOfMaster(master)) owner.set(frame, record.page);
    }
  }
  const pages = new Set<string>();
  const look = (el: CanvasElement) => {
    if (!isDesignNode(el)) return;
    if (pageItemTag(el) || pageItemTemplate(el) !== null) pages.add(el.pageId);
    const page = owner.get(topOf(doc, el).id) ?? owner.get(el.id);
    if (page !== undefined) pages.add(page);
  };
  for (const id of change.updated) {
    const el = doc.get(id);
    if (!el) continue;
    if (isBrochure(el)) pages.add(el.page);
    else look(el);
  }
  for (const el of change.removed) look(el);
  return pages;
}
