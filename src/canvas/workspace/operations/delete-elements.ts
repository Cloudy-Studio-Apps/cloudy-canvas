import { withMembers } from "./members";
import type { WorkspaceParts } from "./workspace-parts.types";

/** Deletes elements, with what goes with them, as one undo step. Returns the removed ids. */
export function deleteElements(parts: WorkspaceParts, ids: Iterable<string>): string[] {
  const removing = [...withMembers(parts, ids, "delete")];
  parts.doc.checkpoint();
  return removeElements(parts, removing);
}

/**
 * Removes exactly these elements (in the current undo step) and lets the product clean up
 * after them. Returns the removed ids.
 */
export function removeElements(
  { doc, product, scene }: WorkspaceParts,
  ids: readonly string[],
): string[] {
  const removing = ids.filter((id) => doc.get(id));
  if (removing.length === 0) return [];
  const before = scene.elements;
  doc.batch(() => {
    doc.remove(removing);
    product.onRemove?.(doc, new Set(removing), before);
  });
  return removing;
}
