import { DB_CARD_DEFAULTS, rowTop, type DbCardElement } from "../../card";
import { resolveEnumLinks, resolveRelations } from "../../links";
import type { SchemaEdge, SchemaGraph } from "./schema-graph.types";

const { headerHeight, rowHeight } = DB_CARD_DEFAULTS;

/** The cards and the links between them. Self-relations are left out: they don't place anything. */
export function schemaGraph(cards: readonly DbCardElement[]): SchemaGraph {
  const edges: SchemaEdge[] = [
    ...resolveRelations(cards)
      .filter((relation) => relation.from.id !== relation.to.id)
      .map((relation) => ({
        from: relation.from.id,
        to: relation.to.id,
        fromOffset: rowCenter(relation.fromRow),
        toOffset: rowCenter(relation.toRow),
      })),
    ...resolveEnumLinks(cards).map((link) => ({
      from: link.table.id,
      to: link.target.id,
      fromOffset: rowCenter(link.row),
      toOffset: headerHeight / 2,
    })),
  ];
  const neighbors = new Map(cards.map((card) => [card.id, new Set<string>()]));
  for (const edge of edges) {
    neighbors.get(edge.from)?.add(edge.to);
    neighbors.get(edge.to)?.add(edge.from);
  }
  return { nodes: new Map(cards.map((card) => [card.id, card])), edges, neighbors };
}

/** The card and every card linked to it, directly or through others. */
export function connectedGroup(graph: SchemaGraph, startId: string): string[] {
  if (!graph.nodes.has(startId)) return [];
  const seen = new Set([startId]);
  const queue = [startId];
  for (let i = 0; i < queue.length; i++) {
    for (const next of graph.neighbors.get(queue[i]!) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return queue;
}

/** The graph split into groups of linked cards. */
export function connectedGroups(graph: SchemaGraph): string[][] {
  const grouped = new Set<string>();
  const groups: string[][] = [];
  for (const id of graph.nodes.keys()) {
    if (grouped.has(id)) continue;
    const group = connectedGroup(graph, id);
    for (const member of group) grouped.add(member);
    groups.push(group);
  }
  return groups;
}

function rowCenter(row: number): number {
  return rowTop(row) + rowHeight / 2;
}
