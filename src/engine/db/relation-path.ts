import type { DbTableShape } from "../document";
import type { Point } from "../geometry.types";
import { columnAnchor } from "./table-layout";
import type { TableSide } from "./table-layout.types";
import type { RelationPath } from "./relation-path.types";

const MIN_HANDLE = 40;
const SELF_LOOP = 48;

/** Path between two column rows, leaving each table from the side that faces the other one. */
export function relationPath(
  from: DbTableShape,
  fromRow: number,
  to: DbTableShape,
  toRow: number,
): RelationPath {
  let fromSide: TableSide;
  let toSide: TableSide;
  if (from.id === to.id) {
    fromSide = toSide = "right";
  } else if (from.x + from.w <= to.x) {
    fromSide = "right";
    toSide = "left";
  } else if (to.x + to.w <= from.x) {
    fromSide = "left";
    toSide = "right";
  } else {
    // Overlapping horizontally: loop out on the side both tables are closest to.
    fromSide = toSide = from.x + from.w / 2 <= to.x + to.w / 2 ? "left" : "right";
  }
  return pathBetween(
    columnAnchor(from, fromRow, fromSide),
    fromSide,
    columnAnchor(to, toRow, toSide),
    toSide,
    from.id === to.id,
  );
}

/** Path from a column anchor to a free point (the pointer while dragging a new relation). */
export function draftPath(from: DbTableShape, fromRow: number, end: Point): RelationPath {
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
