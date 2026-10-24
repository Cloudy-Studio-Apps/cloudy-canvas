import { elementBounds, reorderIndexes, type ReorderDirection } from "../../elements";
import { withMembers } from "./members";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * Moves elements (with what moves with them) in the drawing order, as one undo step: to the
 * front or back, or one step past the nearest element they overlap. Frames keep their order
 * (larger behind smaller). Returns the ids whose position changed.
 */
export function reorderElements(
  parts: WorkspaceParts,
  ids: Iterable<string>,
  direction: ReorderDirection,
): string[] {
  const { doc, kinds, scene } = parts;
  const indexes = reorderIndexes({
    layer: scene.elements.filter((el) => !kinds.kindOf(el).frame),
    moving: withMembers(parts, ids, "move"),
    direction,
    bounds: (el) => elementBounds(kinds.kindOf(el), el),
    above: (count) => doc.nextIndexes(count),
    below: (count) => doc.firstIndexes(count),
  });
  if (indexes.size === 0) return [];
  doc.checkpoint();
  doc.updateMany(new Map([...indexes].map(([id, index]) => [id, { index }])));
  return [...indexes.keys()];
}
