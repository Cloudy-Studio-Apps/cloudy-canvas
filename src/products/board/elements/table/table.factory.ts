import { createElementBase, type Point } from "@canvas";

import { TABLE_DEFAULTS } from "./table.defaults";
import type { TableElement } from "./table.types";

/** An empty table with the default grid, its top-left corner at `at`. */
export function createTable(
  at: Point,
  color: string,
  header: boolean,
  index: string,
): TableElement {
  const { columnCount, rowCount, columnWidth, rowHeight } = TABLE_DEFAULTS;
  const columns = Array.from({ length: columnCount }, () => columnWidth);
  const rows = Array.from({ length: rowCount }, () => rowHeight);
  const rect = {
    x: Math.round(at.x),
    y: Math.round(at.y),
    w: columnCount * columnWidth,
    h: rowCount * rowHeight,
  };
  return {
    ...createElementBase("table", rect, index),
    columns,
    rows,
    cells: rows.map(() => columns.map(() => "")),
    fills: rows.map(() => columns.map(() => "")),
    header,
    color,
  };
}
