import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";

import { placeNewShapes } from "./place-new-shapes";
import { pruneRefs } from "./prune-refs";
import type { ReconcilePlan } from "./reconcile.types";

/** Writes a reconcile plan as one undo step. New shapes are placed next to the existing content. */
export function applyPlan(
  doc: CanvasDocument,
  { shapes, added, removed }: ReconcilePlan,
  /** More edits that belong to the same undo step. */
  extra?: () => void,
): void {
  const newShapes = shapes.filter((shape) => added.has(shape.id));
  const positions = placeNewShapes(doc, newShapes, new Set(removed));
  doc.checkpoint();
  doc.batch(() => {
    if (removed.length) doc.remove(removed);
    for (const shape of shapes) {
      if (added.has(shape.id)) continue;
      doc.update(shape.id, contentPatch(shape));
    }
    newShapes.forEach((shape, i) => {
      doc.add({ ...shape, ...positions[i]!, index: doc.nextIndex() });
    });
    extra?.();
    pruneRefs(doc);
  });
}

/** Everything but the identity and the board order, which existing shapes keep. */
function contentPatch(shape: CanvasElement): ElementPatch {
  const patch: Partial<Record<keyof CanvasElement, unknown>> = { ...shape };
  delete patch.id;
  delete patch.type;
  delete patch.index;
  return patch as ElementPatch;
}
