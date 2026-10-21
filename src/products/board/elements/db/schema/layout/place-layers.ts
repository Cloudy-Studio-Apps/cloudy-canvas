import type { Point } from "@canvas";

import type { CardFootprint, SchemaEdge } from "./schema-graph.types";

/** Space between columns (room for the links' curves and crow's feet) and between cards. */
const COLUMN_GAP = 140;
const ROW_GAP = 48;
const PASSES = 8;

/**
 * Top-left positions for ordered columns: columns side by side, each card as level as it can be
 * with the rows it's linked to, keeping the column's order and the gaps between cards.
 */
export function placeLayers(
  layers: readonly string[][],
  edges: readonly SchemaEdge[],
  sizes: ReadonlyMap<string, CardFootprint>,
): Map<string, Point> {
  const size = (id: string) => sizes.get(id)!;
  const x = new Map<string, number>();
  let left = 0;
  for (const ids of layers) {
    for (const id of ids) x.set(id, left);
    left += Math.max(...ids.map((id) => size(id).w)) + COLUMN_GAP;
  }

  const y = new Map<string, number>();
  for (const ids of layers) {
    const height = ids.reduce((sum, id) => sum + size(id).h + ROW_GAP, -ROW_GAP);
    let top = -height / 2;
    for (const id of ids) {
      y.set(id, top);
      top += size(id).h + ROW_GAP;
    }
  }

  // Where each card would sit to put its linked rows level with theirs.
  const column = new Map<string, number>();
  layers.forEach((ids, i) => ids.forEach((id) => column.set(id, i)));
  const pulls = new Map<string, { other: string; offset: number }[]>(
    [...column.keys()].map((id) => [id, []]),
  );
  for (const edge of edges) {
    if (column.get(edge.from) === column.get(edge.to)) continue;
    pulls.get(edge.from)?.push({ other: edge.to, offset: edge.toOffset - edge.fromOffset });
    pulls.get(edge.to)?.push({ other: edge.from, offset: edge.fromOffset - edge.toOffset });
  }
  const wanted = (id: string): number => {
    const list = pulls.get(id)!;
    if (list.length === 0) return y.get(id)!;
    return list.reduce((sum, pull) => sum + y.get(pull.other)! + pull.offset, 0) / list.length;
  };

  for (let pass = 0; pass < PASSES; pass++) {
    const indexes = layers.map((_, i) => i);
    if (pass % 2 === 1) indexes.reverse();
    for (const i of indexes) {
      const ids = layers[i]!;
      const tops = stack(
        ids.map(wanted),
        ids.map((id) => size(id).h),
      );
      ids.forEach((id, j) => y.set(id, tops[j]!));
    }
  }

  return new Map([...x].map(([id, left]) => [id, { x: left, y: y.get(id)! }]));
}

/**
 * Tops as close to `wanted` as the order and gaps allow: the average of pushing overlapping cards
 * down and pushing them up, so a crowded column spreads both ways.
 */
function stack(wanted: readonly number[], heights: readonly number[]): number[] {
  const down = [...wanted];
  for (let i = 1; i < down.length; i++) {
    down[i] = Math.max(down[i]!, down[i - 1]! + heights[i - 1]! + ROW_GAP);
  }
  const up = [...wanted];
  for (let i = up.length - 2; i >= 0; i--) {
    up[i] = Math.min(up[i]!, up[i + 1]! - heights[i]! - ROW_GAP);
  }
  return down.map((top, i) => (top + up[i]!) / 2);
}
