import type { CanvasDocument, ElementPatch } from "@canvas";

import { BROCHURE_TYPE, isBrochure, type BrochureElement } from "../brochure";
import { keptSections, prunedMasters, withoutMaster } from "./masters/master-edits";
import { detachGenerated } from "./repeats/detach-generated";
import { freedCopyPatches } from "./repeats/freed-copy-patches";
import { removeFrames } from "./slot-edits";

/**
 * After a deletion, in its undo step (an `onRemove`): deleted frames leave every brochure (its
 * pages and masters, and a section starting on a page that went goes), and the brochures of a
 * deleted design page go with it. A deleted page a repeat made is detached first
 * (`detachGenerated`): its row isn't made again, and the other pages of its copy stay where they
 * are as plain pages, freed.
 */
export function pruneBrochure(doc: CanvasDocument, removed: ReadonlySet<string>): void {
  const gone: string[] = [];
  for (const id of doc.ids()) {
    if (doc.field(id, "type") !== BROCHURE_TYPE) continue;
    const brochure = doc.get(id);
    if (!brochure || !isBrochure(brochure)) continue;
    if (removed.has(brochure.page)) {
      gone.push(id);
      continue;
    }
    // Deleted frames leave the pages and the masters; a master left with no frame goes.
    const { masters, gone: goneMasters } = prunedMasters(brochure.masters, removed);
    const copies = brochure.slots.filter(
      (slot) => slot.generated && slot.frames.some((frame) => removed.has(frame)),
    );
    const detach = detachGenerated(brochure, copies, new Set(copies.map((slot) => slot.id)));
    const freed = freedCopyPatches(
      doc,
      id,
      detach.free.filter((frame) => !removed.has(frame)),
    );
    if (freed.size > 0) doc.updateMany(freed);
    let next: BrochureElement = {
      ...brochure,
      slots: removeFrames(detach.slots, removed),
      sections: detach.sections,
      masters,
    };
    for (const master of goneMasters) next = { ...next, ...withoutMaster(next, master) };
    next = { ...next, sections: keptSections(next.sections, next.slots) };
    const patch: ElementPatch<BrochureElement> = {};
    for (const field of ["slots", "masters", "sections", "settings"] as const) {
      if (JSON.stringify(next[field]) !== JSON.stringify(brochure[field])) {
        Object.assign(patch, { [field]: next[field] });
      }
    }
    if (Object.keys(patch).length > 0) doc.update(id, patch);
  }
  if (gone.length > 0) doc.remove(gone);
}
