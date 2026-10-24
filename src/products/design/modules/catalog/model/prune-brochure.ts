import type { CanvasDocument, ElementPatch } from "@canvas";

import type { BrochureElement } from "../brochure";
import { brochureOf } from "./brochure-of";
import { removeFrames, sameSlots } from "./slot-edits";

/** Takes deleted frames out of the brochure, in the deletion's undo step (an `onRemove`). */
export function pruneBrochure(doc: CanvasDocument, removed: ReadonlySet<string>): void {
  const brochure = brochureOf(doc);
  if (!brochure) return;
  const slots = removeFrames(brochure.slots, removed);
  if (sameSlots(slots, brochure.slots)) return;
  const patch: ElementPatch<BrochureElement> = { slots };
  doc.update(brochure.id, patch);
}
