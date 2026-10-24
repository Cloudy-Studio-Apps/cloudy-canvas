import type { CanvasDocument, ElementPatch } from "@canvas";

import { BROCHURE_TYPE, isBrochure, type BrochureElement } from "../brochure";
import { removeFrames, sameSlots } from "./slot-edits";

/**
 * After a deletion, in its undo step (an `onRemove`): deleted frames leave every brochure, and the
 * brochures of a deleted design page go with it.
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
    const slots = removeFrames(brochure.slots, removed);
    if (sameSlots(slots, brochure.slots)) continue;
    const patch: ElementPatch<BrochureElement> = { slots };
    doc.update(id, patch);
  }
  if (gone.length > 0) doc.remove(gone);
}
