import type { ErRelationShape } from "../document";

/**
 * The `1:1`, `1:N`, `N:M` (binary) or `1:N:N` (three or more) label of a relation, from the max
 * cardinalities of its participants. Empty when it can't be told (fewer than two participants, or
 * a max is missing).
 */
export function cardinalityRatio(relation: ErRelationShape): string {
  const { participants } = relation;
  if (participants.length < 2 || participants.some((p) => !p.max)) return "";
  const many = participants.map((p) => p.max !== "1");
  if (participants.length === 2) {
    if (many[0] && many[1]) return "N:M";
    return `${many[0] ? "N" : "1"}:${many[1] ? "N" : "1"}`;
  }
  return many.map((m) => (m ? "N" : "1")).join(":");
}
