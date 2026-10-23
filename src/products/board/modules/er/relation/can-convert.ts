import type { CanvasElement } from "@canvas";

import type { ErRelationElement } from "./relation.types";

/**
 * Whether Convert to entity works on the relation: two sides or more, and no aggregation holds it.
 */
export function canConvert(
  relation: ErRelationElement,
  board: { elements(): readonly CanvasElement[] },
): boolean {
  if (relation.participants.length < 2) return false;
  return !board
    .elements()
    .some(
      (el) => el.type === "er-aggregate" && "relationId" in el && el.relationId === relation.id,
    );
}
