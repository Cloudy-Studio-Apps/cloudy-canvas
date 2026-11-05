import type { CanvasEngine } from "@canvas";
import { DESIGN_BROCHURES } from "../model/design-brochures";
import { deleteSelectedPages } from "./delete-selected-pages";

/**
 * Deletes a copy section's pages (a folder, `sectionId` its expanded id) in one undo step: the
 * whole copy is detached from its repeat first (`detachSection`: its row is never made again),
 * then its pages' frames are deleted (`deleteSelectedPages`). Returns how many frames were kept
 * for another brochure.
 */
export function deleteCopySection(engine: CanvasEngine, sectionId: string): number {
  const brochure = engine.service(DESIGN_BROCHURES).current(engine.scope);
  if (!brochure) return 0;
  const release = engine.doc.holdCheckpoints();
  try {
    engine.doc.checkpoint();
    const slots = new Set(brochure.detachSection(sectionId));
    const frames = (brochure.record()?.slots ?? [])
      .filter((slot) => slots.has(slot.id))
      .flatMap((slot) => slot.frames);
    if (frames.length === 0) return 0;
    engine.select(frames);
    return deleteSelectedPages(engine);
  } finally {
    release();
  }
}
