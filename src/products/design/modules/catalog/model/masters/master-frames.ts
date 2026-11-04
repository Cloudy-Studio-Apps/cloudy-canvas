import type { CanvasDocument } from "@canvas";

import { BROCHURE_TYPE, isBrochure, type BrochureMaster } from "../../brochure";

/** A master's frames that still are set (left, then right). */
export function framesOfMaster(master: BrochureMaster): string[] {
  return [master.left, master.right].filter((id): id is string => id !== null);
}

/**
 * The frames that are masters of the brochures of design page `page`: they're never printed as
 * pages (`brochurePages` skips them), however they were picked.
 */
export function masterFramesOn(doc: CanvasDocument, page: string): Set<string> {
  const frames = new Set<string>();
  for (const id of doc.ids()) {
    if (doc.field(id, "type") !== BROCHURE_TYPE) continue;
    const brochure = doc.get(id);
    if (!brochure || !isBrochure(brochure) || brochure.page !== page) continue;
    for (const master of brochure.masters)
      for (const frame of framesOfMaster(master)) frames.add(frame);
  }
  return frames;
}
