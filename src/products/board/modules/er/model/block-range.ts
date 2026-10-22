import type { ErAttributeElement } from "../attribute/attribute.types";
import type { ErText, TextRange } from "./lang";

/**
 * Where the shape is written in the diagram text: its own block, or for an attribute the block
 * of the entity, relation, hierarchy or aggregation it belongs to.
 */
export function blockRange(
  { ranges }: ErText,
  attributes: readonly ErAttributeElement[],
  id: string,
): TextRange | null {
  const byId = new Map(attributes.map((a) => [a.id, a]));
  let at = id;
  for (let depth = 0; depth <= attributes.length; depth++) {
    const range = ranges.get(at);
    if (range) return range;
    const attribute = byId.get(at);
    if (!attribute) return null;
    at = attribute.ownerId;
  }
  return null;
}
