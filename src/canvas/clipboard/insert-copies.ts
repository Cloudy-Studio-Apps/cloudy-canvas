import type { CanvasElement } from "../elements";
import type { Point } from "../geometry.types";
import { cloneElements } from "./clone-elements";
import type { CopyTarget } from "./insert-copies.types";

/**
 * Adds copies of `elements` above everything else, moved by `offset`, as one undo step. The
 * product fixes them first (unique names, references to elements that weren't copied). Returns
 * original id → copy id for the copies that were added.
 */
export function insertCopies(
  target: CopyTarget,
  elements: readonly CanvasElement[],
  offset: Point,
): Map<string, string> {
  const { doc, kinds } = target;
  if (elements.length === 0) return new Map();
  const { copies, ids } = cloneElements(elements, doc.nextIndexes(elements.length));
  const context = { copied: new Set(ids.values()), existing: target.existing };
  const prepared = target.prepare?.(copies, context) ?? copies;
  const inPlace = offset.x === 0 && offset.y === 0;
  doc.checkpoint();
  doc.batch(() => {
    for (const copy of prepared) {
      doc.add(inPlace ? copy : { ...copy, ...kinds.kindOf(copy).move(copy, offset.x, offset.y) });
    }
  });
  // The product may have left some out.
  const added = new Set(prepared.map((el) => el.id));
  for (const [from, to] of ids) if (!added.has(to)) ids.delete(from);
  return ids;
}
