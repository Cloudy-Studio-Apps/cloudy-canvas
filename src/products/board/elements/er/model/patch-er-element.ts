import type { CanvasDocument, ElementPatch } from "@canvas";

import type { ErElement } from "../base/er.types";

/**
 * Typed `doc.update` for ER elements (the document takes any element's patch): pass the element
 * type, e.g. `patchEr<ErRelationElement>(doc, id, { participants })`. `untracked` writes view
 * state that isn't an undo step.
 */
export function patchEr<E extends ErElement>(
  doc: CanvasDocument,
  id: string,
  patch: ElementPatch<E>,
  untracked = false,
): void {
  if (untracked) doc.updateUntracked(id, patch);
  else doc.update(id, patch);
}
