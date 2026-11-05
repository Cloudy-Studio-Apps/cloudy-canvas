import type { CanvasEngine } from "@canvas";
import { DESIGN_BROCHURES } from "../model/design-brochures";

/**
 * Deletes the selected page frames of the open brochure from the design (Shift+Delete), which
 * takes them out of it; a frame another brochure of the page still prints is only taken out of
 * this one. One undo step. Returns how many frames were kept for another brochure. Throws
 * `UnreadableCopyError`, deleting nothing, for a page a repeat made whose rows can't be read here.
 */
export function deleteSelectedPages(engine: CanvasEngine): number {
  const brochures = engine.service(DESIGN_BROCHURES);
  const brochure = brochures.current(engine.scope);
  if (!brochure || engine.scope === null) return 0;
  const inBrochure = new Set(brochure.pages().flatMap((page) => page.options.map((o) => o.id)));
  const selected = engine.selectedIds().filter((id) => inBrochure.has(id));
  if (selected.length === 0) return 0;
  const elsewhere = new Set(
    brochures
      .list(engine.scope)
      .filter((other) => other.id !== brochure.id)
      .flatMap((other) => other.record()?.slots.flatMap((slot) => slot.frames) ?? []),
  );
  // A copy whose rows can't be read here can't be named: refused (`UnreadableCopyError`).
  brochure.checkCopies(selected);
  const kept = selected.filter((id) => elsewhere.has(id));
  const gone = selected.filter((id) => !elsewhere.has(id));
  const release = engine.doc.holdCheckpoints();
  try {
    engine.doc.checkpoint();
    if (kept.length > 0) brochure.removeFrames(kept);
    // Deleting a frame takes it out of the brochure too (`pruneBrochure`).
    if (gone.length > 0) engine.deleteElements(gone);
  } finally {
    release();
  }
  engine.select([]);
  return kept.length;
}
