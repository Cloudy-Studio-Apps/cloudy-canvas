import type { TableCell } from "./table.layout.types";
import type { TableAxis, TableElement, TablePart } from "./table.types";

/** The part key of a cell (`"2:1"`), as the text editor and the drawer's text slots name it. */
export function cellPart(row: number, column: number): string {
  return `${row}:${column}`;
}

/** The part key of several cells (`"0:0,0:1"`); the first one is the anchor of a Shift range. */
export function cellsPart(cells: readonly TableCell[]): string {
  return cells.map((cell) => cellPart(cell.row, cell.column)).join(",");
}

/** The part key of a whole row or column (`"row:2"`, `"column:0"`), selected by its grip. */
export function linePart(axis: TableAxis, index: number): string {
  return `${axis}:${index}`;
}

export function parseTablePart(part: string | undefined | null): TablePart | null {
  if (!part) return null;
  const [head, tail] = part.split(":");
  if (head === "row" || head === "column") {
    const index = Number(tail);
    return Number.isInteger(index) && index >= 0 ? { kind: head, index } : null;
  }
  const cells = part.split(",").map(parseCell);
  return cells.every((cell) => cell !== null) ? { kind: "cells", cells } : null;
}

/** The cells a part covers: the selected cells, or every cell of a row or column. */
export function partCells(el: TableElement, part: string | null | undefined): TableCell[] {
  const parsed = parseTablePart(part);
  if (!parsed) return [];
  if (parsed.kind === "cells") return parsed.cells;
  if (parsed.kind === "row") return el.columns.map((_, column) => ({ row: parsed.index, column }));
  return el.rows.map((_, row) => ({ row, column: parsed.index }));
}

/**
 * The cells a click selects: the clicked cell; with Shift, the block from the current part's
 * anchor to it; with Ctrl/Cmd, the current cells with the clicked one added or removed.
 */
export function clickedCells(
  el: TableElement,
  cell: TableCell,
  { current, shiftKey, modKey }: { current: string | null; shiftKey: boolean; modKey: boolean },
): TableCell[] {
  const before = partCells(el, current);
  const anchor = before[0];
  if (shiftKey && anchor) {
    const block: TableCell[] = [anchor];
    for (let row = Math.min(anchor.row, cell.row); row <= Math.max(anchor.row, cell.row); row++) {
      const from = Math.min(anchor.column, cell.column);
      for (let column = from; column <= Math.max(anchor.column, cell.column); column++) {
        if (row !== anchor.row || column !== anchor.column) block.push({ row, column });
      }
    }
    return block;
  }
  if (modKey && before.length > 0) {
    const same = (c: TableCell) => c.row === cell.row && c.column === cell.column;
    return before.some(same) ? before.filter((c) => !same(c)) : [...before, cell];
  }
  return [cell];
}

function parseCell(key: string): TableCell | null {
  const [row, column] = key.split(":").map(Number);
  return Number.isInteger(row) && Number.isInteger(column) && row! >= 0 && column! >= 0
    ? { row: row!, column: column! }
    : null;
}
