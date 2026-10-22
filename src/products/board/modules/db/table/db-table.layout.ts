import { measureText, type Point, type Size } from "@canvas";

import { cardHeight, DB_CARD_DEFAULTS, rowTop } from "../card";
import { formatColumnType } from "./column-type";
import type { DbColumn, DbTableElement } from "./db-table.types";
import type { HandleHit, TableSide } from "./db-table.layout.types";

const { fontSize, headerHeight, rowHeight, paddingX } = DB_CARD_DEFAULTS;
const MIN_WIDTH = 220;
/** Space between a column's name and its type. */
const NAME_TYPE_GAP = 24;
/** Room for the PK / NN / UQ badges. */
const BADGE_W = 30;
/** Bold header text is a bit wider than the regular-weight measurement. */
const BOLD_FACTOR = 1.08;
/** Column handles stick out of the table edge by this much (world units at 100%). */
const HANDLE_SIZE = 8;

/** Width and height a table needs to show its name and columns. */
export function tableSize(name: string, columns: readonly DbColumn[]): Size {
  let w = measureText(name, fontSize + 1).w * BOLD_FACTOR + paddingX * 2;
  for (const column of columns) {
    const nameW = measureText(column.name, fontSize).w;
    const typeW = measureText(formatColumnType(column), fontSize).w;
    w = Math.max(w, nameW + NAME_TYPE_GAP + typeW + BADGE_W + paddingX * 2);
  }
  return { w: Math.max(MIN_WIDTH, Math.ceil(w / 4) * 4), h: cardHeight(columns.length) };
}

/** World point where relations attach to a column row. */
export function columnAnchor(table: DbTableElement, row: number, side: TableSide): Point {
  return {
    x: side === "left" ? table.x : table.x + table.w,
    y: table.y + rowTop(row) + rowHeight / 2,
  };
}

/** Row index under a world point, `-1` for the header, `null` outside the table. */
export function rowAt(table: DbTableElement, p: Point): number | null {
  if (p.x < table.x || p.x > table.x + table.w || p.y < table.y || p.y > table.y + table.h)
    return null;
  const y = p.y - table.y;
  if (y < headerHeight) return -1;
  const row = Math.floor((y - headerHeight) / rowHeight);
  return row < table.columns.length ? row : null;
}

/** The column handle (left or right edge of a row) under a world point. `tolerance` is in world units. */
export function handleAt(table: DbTableElement, p: Point, tolerance: number): HandleHit | null {
  const reach = HANDLE_SIZE / 2 + tolerance;
  const side: TableSide | null =
    Math.abs(p.x - table.x) <= reach
      ? "left"
      : Math.abs(p.x - (table.x + table.w)) <= reach
        ? "right"
        : null;
  if (!side) return null;
  const y = p.y - table.y - headerHeight;
  if (y < 0) return null;
  const row = Math.floor(y / rowHeight);
  return row < table.columns.length ? { row, side } : null;
}
