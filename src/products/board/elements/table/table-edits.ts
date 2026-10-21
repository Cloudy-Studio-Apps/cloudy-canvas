import type { ElementPatch, Rect } from "@canvas";

import { TABLE_DEFAULTS } from "./table.defaults";
import { fitRows, rowTextHeight, sum } from "./table.layout";
import type { TableCell } from "./table.layout.types";
import type { TableAxis, TableElement } from "./table.types";

type TableGrid = Pick<TableElement, "columns" | "rows" | "cells" | "fills" | "header">;
type TablePatch = ElementPatch<TableElement>;
/** The per-cell matrices, which every row or column edit changes the same way. */
type CellMatrices = Pick<TableElement, "cells" | "fills">;

/**
 * Patches that edit a table's grid. Each returns the grid fields that changed plus the bounds that
 * follow from them, with rows grown to fit their text. Shared by the kind, its gestures, the
 * options panel and agents.
 */
export function gridPatch(el: TableElement, changes: Partial<TableGrid>): TablePatch {
  const grid: TableGrid = {
    columns: changes.columns ?? el.columns,
    rows: changes.rows ?? el.rows,
    cells: changes.cells ?? el.cells,
    fills: changes.fills ?? el.fills,
    header: changes.header ?? el.header,
  };
  const rows = fitRows(grid);
  return { ...changes, rows, w: sum(grid.columns), h: sum(rows) };
}

export function setCell(el: TableElement, row: number, column: number, text: string): TablePatch {
  return gridPatch(el, { cells: setAt(el.cells, [{ row, column }], text) });
}

/** Empties the given cells' text. */
export function clearCells(el: TableElement, cells: readonly TableCell[]): TablePatch {
  return gridPatch(el, { cells: setAt(el.cells, cells, "") });
}

/** Fills the given cells with a color (`""` clears it). */
export function fillCells(
  el: TableElement,
  cells: readonly TableCell[],
  color: string,
): TablePatch {
  return { fills: setAt(el.fills, cells, color) };
}

export function insertLine(el: TableElement, axis: TableAxis, at: number): TablePatch {
  const { columnWidth, rowHeight } = TABLE_DEFAULTS;
  if (axis === "row") {
    const empty = el.columns.map(() => "");
    return gridPatch(el, {
      rows: insertAt(el.rows, at, rowHeight),
      ...mapMatrices(el, (matrix) => insertAt(matrix, at, empty)),
    });
  }
  return gridPatch(el, {
    columns: insertAt(el.columns, at, columnWidth),
    ...mapRows(el, (row) => insertAt(row, at, "")),
  });
}

/** `null` when it's the last row or column left. */
export function removeLine(el: TableElement, axis: TableAxis, index: number): TablePatch | null {
  if (axis === "row") {
    if (el.rows.length <= 1) return null;
    return gridPatch(el, {
      rows: removeAt(el.rows, index),
      ...mapMatrices(el, (matrix) => removeAt(matrix, index)),
    });
  }
  if (el.columns.length <= 1) return null;
  return gridPatch(el, {
    columns: removeAt(el.columns, index),
    ...mapRows(el, (row) => removeAt(row, index)),
  });
}

/** Moves a row or column from `from` to `to` (both indexes in the current grid). */
export function moveLine(el: TableElement, axis: TableAxis, from: number, to: number): TablePatch {
  if (axis === "row") {
    return gridPatch(el, {
      rows: moveAt(el.rows, from, to),
      ...mapMatrices(el, (matrix) => moveAt(matrix, from, to)),
    });
  }
  return gridPatch(el, {
    columns: moveAt(el.columns, from, to),
    ...mapRows(el, (row) => moveAt(row, from, to)),
  });
}

/** Gives one row or column a new size (clamped to the minimum, and rows to their text). */
export function resizeLine(
  el: TableElement,
  axis: TableAxis,
  index: number,
  size: number,
): TablePatch {
  if (axis === "column") {
    const width = Math.round(Math.max(TABLE_DEFAULTS.minColumnWidth, size));
    return gridPatch(el, { columns: el.columns.map((w, i) => (i === index ? width : w)) });
  }
  const height = Math.round(Math.max(rowTextHeight(el, index), size));
  return gridPatch(el, { rows: el.rows.map((h, i) => (i === index ? height : h)) });
}

/** Scales every column and row to new bounds (rows never below their text). */
export function scaleTable(el: TableElement, rect: Rect): TablePatch {
  const { minColumnWidth, minRowHeight } = TABLE_DEFAULTS;
  const sx = rect.w / Math.max(1, el.w);
  const sy = rect.h / Math.max(1, el.h);
  const columns = el.columns.map((w) => Math.max(minColumnWidth, Math.round(w * sx)));
  const rows = el.rows.map((h) => Math.max(minRowHeight, Math.round(h * sy)));
  const grid = { ...el, columns, rows };
  const fitted = rows.map((h, i) => Math.max(h, rowTextHeight(grid, i)));
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    columns,
    rows: fitted,
    w: sum(columns),
    h: sum(fitted),
  };
}

/**
 * The grid for a list of rows (e.g. an agent's): ragged rows are padded with empty cells, and the
 * existing column widths, row heights and fills are kept where they still apply.
 */
export function gridFromCells(el: TableElement, cells: readonly (readonly string[])[]): TablePatch {
  const { columnWidth, rowHeight } = TABLE_DEFAULTS;
  const columnCount = Math.max(1, ...cells.map((row) => row.length));
  const rowCount = Math.max(1, cells.length);
  const matrix = (source: readonly (readonly string[])[]) =>
    Array.from({ length: rowCount }, (_, r) =>
      Array.from({ length: columnCount }, (_, c) => source[r]?.[c] ?? ""),
    );
  return gridPatch(el, {
    columns: Array.from({ length: columnCount }, (_, i) => el.columns[i] ?? columnWidth),
    rows: Array.from({ length: rowCount }, (_, i) => el.rows[i] ?? rowHeight),
    cells: matrix(cells),
    fills: matrix(el.fills),
  });
}

/** Cell colors for the table's grid from a list of rows (e.g. an agent's), padded or cut to fit. */
export function gridFills(el: TableElement, fills: readonly (readonly string[])[]): string[][] {
  return el.rows.map((_, r) => el.columns.map((_, c) => fills[r]?.[c] ?? ""));
}

/** Applies the same row-list edit to every per-cell matrix. */
function mapMatrices(el: TableElement, edit: (matrix: string[][]) => string[][]): CellMatrices {
  return { cells: edit(el.cells), fills: edit(el.fills) };
}

/** Applies the same edit to each row of every per-cell matrix (a column edit). */
function mapRows(el: TableElement, edit: (row: string[]) => string[]): CellMatrices {
  return mapMatrices(el, (matrix) => matrix.map(edit));
}

function setAt(matrix: string[][], cells: readonly TableCell[], value: string): string[][] {
  const hit = (row: number, column: number) =>
    cells.some((cell) => cell.row === row && cell.column === column);
  return matrix.map((values, r) => values.map((v, c) => (hit(r, c) ? value : v)));
}

function insertAt<T>(list: readonly T[], at: number, item: T): T[] {
  return [...list.slice(0, at), item, ...list.slice(at)];
}

function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

function moveAt<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}
