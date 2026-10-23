import { erNotation } from "../base/er-notation";
import type { ErRelationElement } from "./relation.types";

/**
 * The `1:1`, `1:N`, `N:M` (binary) or `1:N:N` (three or more) label of a relation, from the max
 * cardinalities of its participants, in the order they're written. The diagram's notation says how
 * a two-way relation is read: `own`, each side from its own max, or `across`, each side from the
 * other's (`Cliente (0,n)`, `Pedido (1,1)` is `1:N`, as the crow's feet say). Empty when it can't
 * be told (fewer than two participants, or a max is missing).
 */
export function cardinalityRatio(relation: ErRelationElement): string {
  const { participants } = relation;
  if (participants.length < 2 || participants.some((p) => !p.max)) return "";
  const own = participants.map((p) => p.max !== "1");
  if (participants.length === 2) {
    const across = erNotation(relation.notation).ratio === "across";
    const many = across ? [own[1], own[0]] : own;
    if (many[0] && many[1]) return "N:M";
    return `${many[0] ? "N" : "1"}:${many[1] ? "N" : "1"}`;
  }
  return own.map((m) => (m ? "N" : "1")).join(":");
}
