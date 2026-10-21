import type { SchemaEdge } from "./schema-graph.types";

/**
 * Splits the cards into columns, left to right, so every link points left: referenced tables and
 * enums sit left of the tables that use them. Cycles are broken first. Cards nothing points to
 * from further left (enums, top-level tables) are pulled next to the cards that use them, so links
 * stay short. `ids` is in the order to visit cycles in (the cards' current top-to-bottom order).
 */
export function assignLayers(ids: readonly string[], edges: readonly SchemaEdge[]): string[][] {
  const parents = new Map<string, string[]>(ids.map((id) => [id, []]));
  const children = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const edge of acyclic(ids, edges)) {
    parents.get(edge.from)!.push(edge.to);
    children.get(edge.to)!.push(edge.from);
  }

  const layer = new Map<string, number>();
  const depth = (id: string): number => {
    let value = layer.get(id);
    if (value === undefined) {
      value = Math.max(-1, ...parents.get(id)!.map(depth)) + 1;
      layer.set(id, value);
    }
    return value;
  };
  for (const id of ids) depth(id);

  for (const id of ids) {
    const below = children.get(id)!;
    if (parents.get(id)!.length === 0 && below.length > 0) {
      layer.set(id, Math.min(...below.map((child) => layer.get(child)!)) - 1);
    }
  }

  const first = Math.min(...layer.values());
  const layers: string[][] = [];
  for (const id of ids) (layers[layer.get(id)! - first] ??= []).push(id);
  return layers.filter((column) => column.length > 0);
}

/** The edges without the ones that close a cycle (back edges of a depth-first walk). */
function acyclic(ids: readonly string[], edges: readonly SchemaEdge[]): SchemaEdge[] {
  const outgoing = new Map<string, SchemaEdge[]>(ids.map((id) => [id, []]));
  for (const edge of edges) outgoing.get(edge.from)?.push(edge);
  const state = new Map<string, "open" | "done">();
  const kept: SchemaEdge[] = [];
  const visit = (id: string): void => {
    state.set(id, "open");
    for (const edge of outgoing.get(id)!) {
      const target = state.get(edge.to);
      if (target === "open") continue;
      kept.push(edge);
      if (target === undefined) visit(edge.to);
    }
    state.set(id, "done");
  };
  for (const id of ids) if (!state.has(id)) visit(id);
  return kept;
}
