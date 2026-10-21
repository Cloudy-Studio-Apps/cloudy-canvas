import {
  DB_FONT_SIZE,
  DB_HEADER_H,
  DB_MIN_W,
  DB_PADDING_X,
  DB_ROW_H,
  type DbColumn,
  type DbTableShape,
} from "../document";
import type { Point, Size } from "../geometry.types";
import { measureText } from "../text/text-metrics";
import type { HandleHit, TableSide } from "./table-layout.types";

/** Space between a column's name and its type. */
const NAME_TYPE_GAP = 24;
/** Room for the PK / NN / UQ badges. */
const BADGE_W = 30;
/** Bold header text is a bit wider than the regular-weight measurement. */
const BOLD_FACTOR = 1.08;
/** Column handles stick out of the table edge by this much (world units at 100%). */
export const HANDLE_SIZE = 8;

/** Width and height a table needs to show its name and columns. */
export function tableSize(name: string, columns: readonly DbColumn[]): Size {
  let w = measureText(name, DB_FONT_SIZE + 1).w * BOLD_FACTOR + DB_PADDING_X * 2;
  for (const column of columns) {
    const nameW = measureText(column.name, DB_FONT_SIZE).w;
    const typeW = measureText(column.type, DB_FONT_SIZE).w;
    w = Math.max(w, nameW + NAME_TYPE_GAP + typeW + BADGE_W + DB_PADDING_X * 2);
  }
  return {
    w: Math.max(DB_MIN_W, Math.ceil(w / 4) * 4),
    h: DB_HEADER_H + Math.max(columns.length, 1) * DB_ROW_H,
  };
}

/** Top of a column row, relative to the table. */
export function rowTop(row: number): number {
  return DB_HEADER_H + row * DB_ROW_H;
}

/** World point where relations attach to a column row. */
export function columnAnchor(table: DbTableShape, row: number, side: TableSide): Point {
  return {
    x: side === "left" ? table.x : table.x + table.w,
    y: table.y + rowTop(row) + DB_ROW_H / 2,
  };
}

/** Row index under a world point, `-1` for the header, `null` outside the table. */
export function rowAt(table: DbTableShape, p: Point): number | null {
  if (p.x < table.x || p.x > table.x + table.w || p.y < table.y || p.y > table.y + table.h)
    return null;
  const y = p.y - table.y;
  if (y < DB_HEADER_H) return -1;
  const row = Math.floor((y - DB_HEADER_H) / DB_ROW_H);
  return row < table.columns.length ? row : null;
}

/** The column handle (left or right edge of a row) under a world point. `tolerance` is in world units. */
export function handleAt(table: DbTableShape, p: Point, tolerance: number): HandleHit | null {
  const reach = HANDLE_SIZE / 2 + tolerance;
  const side: TableSide | null =
    Math.abs(p.x - table.x) <= reach
      ? "left"
      : Math.abs(p.x - (table.x + table.w)) <= reach
        ? "right"
        : null;
  if (!side) return null;
  const y = p.y - table.y - DB_HEADER_H;
  if (y < 0) return null;
  const row = Math.floor(y / DB_ROW_H);
  return row < table.columns.length ? { row, side } : null;
}
