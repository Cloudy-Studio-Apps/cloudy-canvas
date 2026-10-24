import type { CanvasDocument, ElementPatch } from "@canvas";

import { pagesOf } from "../../pages";
import {
  BROCHURE_DEFAULTS,
  BROCHURE_TYPE,
  createBrochure,
  isBrochure,
  type BrochureElement,
  type BrochureSlot,
} from "../brochure";
import { isPageFrame } from "./page-frame";

/**
 * Brochures from before they belonged to a design page (one per design) get a page: their slots
 * are grouped by the page of the frame each prints; the first group keeps the record, the others
 * become brochures of their own with the same settings. Without any frame left it goes on the
 * first page. Not an undo step (a `designMigrations` entry).
 */
export function splitLegacyBrochure(doc: CanvasDocument): void {
  const legacy = doc
    .ids()
    .filter((id) => doc.field(id, "type") === BROCHURE_TYPE && !doc.field(id, "page"));
  if (legacy.length === 0) return;
  const firstPage = pagesOf(doc)[0]?.id;
  if (firstPage === undefined) return;
  for (const id of legacy) {
    const brochure = doc.get(id);
    if (!brochure || !isBrochure(brochure)) continue;
    const groups = slotsByPage(doc, brochure.slots);
    if (groups.size === 0) groups.set(firstPage, []);
    const [first, ...rest] = [...groups];
    if (!first) continue;
    const patch: ElementPatch<BrochureElement> = {
      page: first[0],
      name: brochure.name || BROCHURE_DEFAULTS.name,
      slots: [...first[1]],
    };
    doc.updateUntracked(id, patch);
    for (const [page, slots] of rest) {
      const split: BrochureElement = {
        ...createBrochure(doc.nextIndex(), page, patch.name ?? BROCHURE_DEFAULTS.name),
        slots,
        settings: { ...brochure.settings },
      };
      doc.addUntracked(split);
    }
  }
}

/** Slots grouped by the design page of the frame each prints (or its first frame that exists). */
function slotsByPage(
  doc: CanvasDocument,
  slots: readonly BrochureSlot[],
): Map<string, BrochureSlot[]> {
  const groups = new Map<string, BrochureSlot[]>();
  for (const slot of slots) {
    const frames = [slot.chosen, ...slot.frames].map((frame) => doc.get(frame));
    const frame = frames.find(isPageFrame);
    if (!frame) continue;
    const group = groups.get(frame.pageId) ?? [];
    group.push(slot);
    groups.set(frame.pageId, group);
  }
  return groups;
}
