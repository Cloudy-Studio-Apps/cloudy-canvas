import { measureWrapped, type Point, type Rect } from "@canvas";

import { tableTypography } from "./table-typography";
import type { TableCell, TableLine } from "./table.layout.types";
import type { TableAxis, TableElement } from "./table.types";

/** Where each size starts: `[0, a, a + b, …]`, one more entry than `sizes`. */
export function offsets(sizes: readonly number[]): number[] {
  const result = [0];
  for (const size of sizes) result.push(result[result.length - 1]! + size);
  return result;
}

export function sum(sizes: readonly number[]): number {
  return sizes.reduce((total, size) => total + size, 0);
}

/** A cell's box, relative to the table's top-left corner. */
export function cellBox(el: TableElement, { row, column }: TableCell): Rect {
  const xs = offsets(el.columns);
  const ys = offsets(el.rows);
  return { x: xs[column] ?? 0, y: ys[row] ?? 0, w: el.columns[column] ?? 0, h: el.rows[row] ?? 0 };
}

/** The cell under a world point, or `null` outside the grid. */
export function cellAt(el: TableElement, p: Point): TableCell | null {
  const row = indexAt(el.rows, p.y - el.y);
  const column = indexAt(el.columns, p.x - el.x);
  return row === null || column === null ? null : { row, column };
}

/** World bounds of a whole row or column. */
export function lineBounds(el: TableElement, axis: TableAxis, index: number): Rect | null {
  const sizes = axis === "row" ? el.rows : el.columns;
  const size = sizes[index];
  if (size === undefined) return null;
  const start = offsets(sizes)[index]!;
  return axis === "row"
    ? { x: el.x, y: el.y + start, w: el.w, h: size }
    : { x: el.x + start, y: el.y, w: size, h: el.h };
}

/** The grid line within `reach` of a world point (inner lines and the right and bottom edges). */
export function gridLineAt(el: TableElement, p: Point, reach: number): TableLine | null {
  const inside = (min: number, max: number, v: number) => v >= min - reach && v <= max + reach;
  if (!inside(el.x, el.x + el.w, p.x) || !inside(el.y, el.y + el.h, p.y)) return null;
  const column = lineNear(el.columns, p.x - el.x, reach);
  if (column !== null) return { axis: "column", index: column };
  const row = lineNear(el.rows, p.y - el.y, reach);
  return row === null ? null : { axis: "row", index: row };
}

/** How cell text is laid out: header cells are bold. */
export function cellFontWeight(el: Pick<TableElement, "header">, row: number): 400 | 600 {
  return el.header && row === 0 ? 600 : 400;
}

/** The height a row needs for its text at the current column widths. */
export function rowTextHeight(
  el: Pick<TableElement, "cells" | "columns" | "header" | "textScale">,
  row: number,
): number {
  const { fontSize, padX, padY, minRowHeight } = tableTypography(el);
  const weight = cellFontWeight(el, row);
  let height: number = minRowHeight;
  el.columns.forEach((width, column) => {
    const text = el.cells[row]?.[column] ?? "";
    if (!text) return;
    const { h } = measureWrapped(text, fontSize, Math.max(1, width - padX * 2), weight);
    height = Math.max(height, Math.ceil(h + padY * 2));
  });
  return height;
}

/** Row heights grown to fit their text (never shrunk below what they were). */
export function fitRows(
  el: Pick<TableElement, "cells" | "columns" | "header" | "rows" | "textScale">,
): number[] {
  return el.rows.map((height, row) => Math.max(height, rowTextHeight(el, row)));
}

function indexAt(sizes: readonly number[], v: number): number | null {
  if (v < 0) return null;
  let end = 0;
  for (let i = 0; i < sizes.length; i++) {
    end += sizes[i]!;
    if (v <= end) return i;
  }
  return null;
}

/** The line (after index i) within `reach` of `v`, skipping the leading edge. */
function lineNear(sizes: readonly number[], v: number, reach: number): number | null {
  const ends = offsets(sizes).slice(1);
  const index = ends.findIndex((end) => Math.abs(end - v) <= reach);
  return index === -1 ? null : index;
}
