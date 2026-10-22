import type { SchemaEdge } from "./schema-graph.types";

const SWEEPS = 8;

/**
 * Orders each column top to bottom so links cross as little as possible: every card moves to the
 * average position of the cards it's linked to in other columns (the barycenter heuristic), in
 * sweeps that alternate direction. Columns start in their current order, which ties keep.
 */
export function orderLayers(layers: readonly string[][], edges: readonly SchemaEdge[]): string[][] {
  const order = layers.map((column) => [...column]);
  const column = new Map<string, number>();
  order.forEach((ids, i) => ids.forEach((id) => column.set(id, i)));
  const neighbors = new Map<string, string[]>([...column.keys()].map((id) => [id, []]));
  for (const edge of edges) {
    if (column.get(edge.from) === column.get(edge.to)) continue;
    neighbors.get(edge.from)?.push(edge.to);
    neighbors.get(edge.to)?.push(edge.from);
  }

  // Each card's place in its column, from 0 to 1, so columns of different lengths compare.
  const place = new Map<string, number>();
  const measure = (ids: readonly string[]) =>
    ids.forEach((id, i) => place.set(id, (i + 0.5) / ids.length));
  order.forEach(measure);

  for (let sweep = 0; sweep < SWEEPS; sweep++) {
    const indexes = order.map((_, i) => i);
    if (sweep % 2 === 1) indexes.reverse();
    for (const i of indexes) {
      const ids = order[i]!;
      const key = new Map(
        ids.map((id) => {
          const linked = neighbors.get(id)!;
          if (linked.length === 0) return [id, place.get(id)!];
          return [id, linked.reduce((sum, other) => sum + place.get(other)!, 0) / linked.length];
        }),
      );
      ids.sort((a, b) => key.get(a)! - key.get(b)!);
      measure(ids);
    }
  }
  return order;
}
