import type { CanvasDocument, ElementPatch } from "@canvas";

import { BROCHURE_TYPE, isBrochure, type BrochureElement } from "../brochure";
import { keptSections, prunedMasters, withoutMaster } from "./masters/master-edits";
import { removeFrames } from "./slot-edits";

/**
 * After a deletion, in its undo step (an `onRemove`): deleted frames leave every brochure (its
 * pages and masters, and a section starting on a page that went goes), and the brochures of a
 * deleted design page go with it.
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
    let next: BrochureElement = {
      ...brochure,
      slots: removeFrames(brochure.slots, removed),
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
