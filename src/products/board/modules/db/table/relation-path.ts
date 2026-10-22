import type { Point, Rect } from "@canvas";

import { DB_CARD_DEFAULTS, type DbCardElement } from "../card";
import { columnAnchor } from "./db-table.layout";
import type { TableSide } from "./db-table.layout.types";
import type { DbTableElement } from "./db-table.types";
import type { RelationPath } from "./relation-path.types";

const MIN_HANDLE = 40;
const SELF_LOOP = 48;

/** Path between two column rows, leaving each table from the side that faces the other one. */
export function relationPath(
  from: DbTableElement,
  fromRow: number,
  to: DbTableElement,
  toRow: number,
): RelationPath {
  const [fromSide, toSide] = facingSides(from, to, from.id === to.id);
  return pathBetween(
    columnAnchor(from, fromRow, fromSide),
    fromSide,
    columnAnchor(to, toRow, toSide),
    toSide,
    from.id === to.id,
  );
}

/** Path from a column anchor to a free point (the pointer while dragging a new relation). */
export function draftPath(from: DbTableElement, fromRow: number, end: Point): RelationPath {
  const side: TableSide = end.x < from.x + from.w / 2 ? "left" : "right";
  const endSide: TableSide = side === "left" ? "right" : "left";
  return pathBetween(columnAnchor(from, fromRow, side), side, end, endSide, false);
}

function pathBetween(
  start: Point,
  startSide: TableSide,
  end: Point,
  endSide: TableSide,
  self: boolean,
): RelationPath {
  const startDir = startSide === "left" ? -1 : 1;
  const endDir = endSide === "left" ? -1 : 1;
  const reach = self ? SELF_LOOP : Math.max(MIN_HANDLE, Math.abs(end.x - start.x) / 2);
  return {
    start,
    c1: { x: start.x + startDir * reach, y: start.y },
    c2: { x: end.x + endDir * reach, y: end.y },
    end,
    startDir,
    endDir,
  };
}

/** Path from a column row to the header of the card (an enum) it's typed with. */
export function enumLinkPath(
  table: DbTableElement,
  row: number,
  target: DbCardElement,
): RelationPath {
  const [fromSide, toSide] = facingSides(table, target, false);
  const end = {
    x: toSide === "left" ? target.x : target.x + target.w,
    y: target.y + DB_CARD_DEFAULTS.headerHeight / 2,
  };
  return pathBetween(columnAnchor(table, row, fromSide), fromSide, end, toSide, false);
}

/** The sides of two boxes that face each other (both right for a box linked to itself). */
function facingSides(from: Rect, to: Rect, self: boolean): [TableSide, TableSide] {
  if (self) return ["right", "right"];
  if (from.x + from.w <= to.x) return ["right", "left"];
  if (to.x + to.w <= from.x) return ["left", "right"];
  // Overlapping horizontally: loop out on the side both boxes are closest to.
  const side: TableSide = from.x + from.w / 2 <= to.x + to.w / 2 ? "left" : "right";
  return [side, side];
}
