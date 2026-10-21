import type { ErRelationShape } from "../document";

/**
 * The `1:1`, `1:N` or `N:M` label of a binary relation, from the max cardinalities of its two
 * participants. Empty when it can't be told (not binary, or a max is missing).
 */
export function cardinalityRatio(relation: ErRelationShape): string {
  if (relation.participants.length !== 2) return "";
  const [a, b] = relation.participants;
  if (!a?.max || !b?.max) return "";
  const manyA = a.max !== "1";
  const manyB = b.max !== "1";
  if (manyA && manyB) return "N:M";
  return `${manyA ? "N" : "1"}:${manyB ? "N" : "1"}`;
}
