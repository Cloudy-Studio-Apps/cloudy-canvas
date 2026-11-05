import type { CanvasDocument, ElementPatch } from "@canvas";

import { BROCHURE_TYPE, isBrochure, type BrochureElement, type BrochureSlot } from "../brochure";
import { keptSections, prunedMasters, withoutMaster } from "./masters/master-edits";
import { brochureExpansion } from "./repeats/brochure-expansion";
import { copyRows } from "./repeats/copy-rows";
import { detachPages } from "./repeats/detach-pages";
import { withoutStaleDetached } from "./repeats/stale-detached";
import { removeFrames } from "./slot-edits";

/**
 * After a deletion, in its undo step (an `onRemove`): deleted frames leave every brochure (its
 * pages and masters, and a section starting on a page that went goes), and the brochures of a
 * deleted design page go with it. A deleted page a repeat made is taken out of its repeat
 * (`detachPages`), so that page isn't made again while the rest of its copy still is (a copy
 * folder's delete detaches the whole copy first, `deleteCopySection`). What a loop that went
 * (its template page deleted) left is cleared (`withoutStaleDetached`).
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
    // A copy whose rows can't be read here is only dropped (never named by a guess); the
    // Catalog mode refuses deleting one (`checkCopies`), other deletes still remove it.
    const read = copies.length > 0 ? copyRows(brochureExpansion(doc, brochure)) : () => null;
    const named = copies.filter((slot) => read(slot));
    const rowsOf = (slot: BrochureSlot) => read(slot) ?? [];
    const detach = detachPages(brochure, named, rowsOf, new Set(named.map((slot) => slot.id)));
    const kept = withoutStaleDetached({
      slots: removeFrames(detach.slots, removed),
      sections: detach.sections,
    });
    let next: BrochureElement = { ...brochure, ...kept, masters };
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
