import type { CanvasElement, ElementDefaults, Size } from "@canvas";

import type { TableCell } from "./table.layout.types";

/**
 * A grid of text cells. Column widths and row heights are stored; the bounds are their sums. Rows
 * grow to fit their text, so they're never shorter than what's written in them.
 */
export interface TableElement extends CanvasElement {
  type: "table";
  /** Column widths, left to right. */
  columns: number[];
  /** Row heights, top to bottom. */
  rows: number[];
  /** Cell texts, `cells[row][column]`. */
  cells: string[][];
  /** Cell background colors, `fills[row][column]`; `""` is the default (white, or the header tint). */
  fills: string[][];
  /** Whether the first row is a bold, tinted header. */
  header: boolean;
  /** The header row's tint. */
  color: string;
  /**
   * How much its text and cell insets are grown or shrunk (the Scale tool); unset is 1.
   */
  textScale?: number;
}

export interface TableDefaults extends ElementDefaults {
  size: Size;
  fontSize: number;
  /** A new table's grid. */
  columnCount: number;
  rowCount: number;
  columnWidth: number;
  rowHeight: number;
  /** Text inset inside a cell. */
  padX: number;
  padY: number;
  minColumnWidth: number;
  minRowHeight: number;
  /** Thickness of the "+" strips beside a selected table, and their gap to it (screen px). */
  addBarPx: number;
  addGapPx: number;
  /** Row and column grips: their distance outside the table, length and thickness (screen px). */
  gripOffsetPx: number;
  gripLengthPx: number;
  gripThicknessPx: number;
  /** How close to a grid line counts as grabbing it (screen px). */
  lineReachPx: number;
}

/**
 * A part of a table: some cells (one is edited in place; several are picked with Shift or
 * Ctrl/Cmd), or a whole row or column (selected by its grip).
 */
export type TablePart =
  | { kind: "cells"; cells: TableCell[] }
  | { kind: "row"; index: number }
  | { kind: "column"; index: number };

/** Which way a grid line or a grip runs: `column` lines are vertical, `row` lines horizontal. */
export type TableAxis = "row" | "column";
