import type { Point } from "@canvas";

import { assignLayers } from "./assign-layers";
import { orderLayers } from "./order-layers";
import { placeLayers } from "./place-layers";
import type { CardFootprint, SchemaGraph } from "./schema-graph.types";

/**
 * A layered layout of one group of linked cards (Sugiyama style): columns from the links'
 * direction, an order that limits crossings, then positions that keep linked rows level. Positions
 * are top-left corners with the group's top-left at (0, 0).
 */
export function layoutGroup(
  graph: SchemaGraph,
  ids: readonly string[],
  sizes: ReadonlyMap<string, CardFootprint>,
): Map<string, Point> {
  const members = new Set(ids);
  const edges = graph.edges.filter((edge) => members.has(edge.from) && members.has(edge.to));
  const byTop = [...ids].sort((a, b) => graph.nodes.get(a)!.y - graph.nodes.get(b)!.y);
  const positions = placeLayers(orderLayers(assignLayers(byTop, edges), edges), edges, sizes);
  const minX = Math.min(...[...positions.values()].map((p) => p.x));
  const minY = Math.min(...[...positions.values()].map((p) => p.y));
  return new Map(
    [...positions].map(([id, p]) => [id, { x: Math.round(p.x - minX), y: Math.round(p.y - minY) }]),
  );
}
