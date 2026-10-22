import type { CanvasDocument, Point } from "@canvas";

import { isDbEnum } from "../../enum";
import { isDbTable } from "../../table";
import type { DbCardElement } from "../../card";
import { cardFootprint } from "./card-footprint";
import { layoutGroup } from "./layout-group";
import { connectedGroups, schemaGraph } from "./schema-graph";
import type { CardFootprint } from "./schema-graph.types";

/** Space between laid-out groups, and the width loose cards wrap at (at least). */
const GROUP_GAP = 160;
const LOOSE_GAP = 80;
const MIN_ROW_WIDTH = 1200;

/**
 * Lays out the schema's tables and enums (only `ids`, when given), keeping their top-left corner
 * where it is: each group of linked cards gets a layered layout, groups are stacked largest first
 * and unlinked cards wrap in rows below them. One undo step; nothing happens if nothing moves.
 */
export function tidySchema(doc: CanvasDocument, ids?: readonly string[]): void {
  const only = ids && new Set(ids);
  const cards = doc
    .all()
    .filter((el): el is DbCardElement => isDbTable(el) || isDbEnum(el))
    .filter((card) => !only || only.has(card.id));
  if (cards.length === 0) return;

  const graph = schemaGraph(cards);
  const sizes = new Map(cards.map((card) => [card.id, cardFootprint(card)]));
  const positions = packGroups(
    connectedGroups(graph).map((group) => layoutGroup(graph, group, sizes)),
    sizes,
  );

  const dx = Math.min(...cards.map((card) => card.x));
  const dy = Math.min(...cards.map((card) => card.y));
  const patches = new Map<string, Point>();
  for (const card of cards) {
    const p = positions.get(card.id);
    if (!p) continue;
    const next = { x: Math.round(p.x + dx), y: Math.round(p.y + dy) };
    if (next.x !== card.x || next.y !== card.y) patches.set(card.id, next);
  }
  if (patches.size === 0) return;
  doc.checkpoint();
  doc.updateMany(patches);
}

/** Groups (each laid out from (0, 0)) stacked top to bottom, single cards in rows at the end. */
function packGroups(
  groups: readonly Map<string, Point>[],
  sizes: ReadonlyMap<string, CardFootprint>,
): Map<string, Point> {
  const extent = (group: Map<string, Point>) => {
    let w = 0;
    let h = 0;
    for (const [id, p] of group) {
      w = Math.max(w, p.x + sizes.get(id)!.w);
      h = Math.max(h, p.y + sizes.get(id)!.h);
    }
    return { w, h };
  };
  const linked = groups.filter((group) => group.size > 1).sort((a, b) => b.size - a.size);
  const loose = groups.filter((group) => group.size === 1).flatMap((group) => [...group.keys()]);

  const result = new Map<string, Point>();
  let top = 0;
  let width = MIN_ROW_WIDTH;
  for (const group of linked) {
    for (const [id, p] of group) result.set(id, { x: p.x, y: p.y + top });
    const size = extent(group);
    top += size.h + GROUP_GAP;
    width = Math.max(width, size.w);
  }

  let x = 0;
  let rowHeight = 0;
  for (const id of loose) {
    const size = sizes.get(id)!;
    if (x > 0 && x + size.w > width) {
      x = 0;
      top += rowHeight + LOOSE_GAP;
      rowHeight = 0;
    }
    result.set(id, { x, y: top });
    x += size.w + LOOSE_GAP;
    rowHeight = Math.max(rowHeight, size.h);
  }
  return result;
}
