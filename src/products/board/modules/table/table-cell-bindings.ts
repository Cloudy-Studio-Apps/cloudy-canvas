import type { TableCell } from "./table.layout.types";
import type { TableAxis, TableElement } from "./table.types";

const CELL_PATH = /^fills\.(\d+)\.(\d+)$/;

/**
 * The table's bindings after its rows or columns moved: each cell fill's binding
 * (`fills.<row>.<column>`) follows its cell along `axis` to `map(index)`, or is dropped when `map`
 * returns `null` (its line removed). `{}` when no cell fill is bound, so the patch stays as it was.
 */
export function moveCellBindings(
  el: TableElement,
  axis: TableAxis,
  map: (index: number) => number | null,
): Pick<TableElement, "bindings"> {
  const bindings = el.bindings ?? {};
  if (!Object.keys(bindings).some((path) => CELL_PATH.test(path))) return {};
  const next: Record<string, string> = {};
  for (const [path, id] of Object.entries(bindings)) {
    const match = CELL_PATH.exec(path);
    if (!match) {
      next[path] = id;
      continue;
    }
    const row = Number(match[1]);
    const column = Number(match[2]);
    const moved = map(axis === "row" ? row : column);
    if (moved === null) continue;
    next[axis === "row" ? `fills.${moved}.${column}` : `fills.${row}.${moved}`] = id;
  }
  return { bindings: next };
}

/** Where each index goes when a line is inserted at `at`. */
export const afterInsert = (at: number) => (i: number) => (i >= at ? i + 1 : i);

/** Where each index goes when the line at `index` is removed (`null`: that line). */
export const afterRemove = (index: number) => (i: number) =>
  i === index ? null : i > index ? i - 1 : i;

/** Where each index goes when the line at `from` moves to `to`. */
export const afterMove = (from: number, to: number) => (i: number) => {
  if (i === from) return to;
  if (from < to && i > from && i <= to) return i - 1;
  if (to < from && i >= to && i < from) return i + 1;
  return i;
};

/** The bindings with these cells' fills bound to a color variable, or unbound for `null`. */
export function bindCells(
  el: TableElement,
  cells: readonly TableCell[],
  variableId: string | null,
): Required<Pick<TableElement, "bindings">> {
  const bindings = { ...el.bindings };
  for (const { row, column } of cells) {
    if (variableId) bindings[cellFillPath(row, column)] = variableId;
    else delete bindings[cellFillPath(row, column)];
  }
  return { bindings };
}

/** Where a cell's fill is bound: `fills.<row>.<column>`. */
export function cellFillPath(row: number, column: number): string {
  return `fills.${row}.${column}`;
}
