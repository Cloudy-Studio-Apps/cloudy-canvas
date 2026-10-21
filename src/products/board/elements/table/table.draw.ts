import type { ElementView } from "@canvas";

import { INK_COLOR, TABLE_CELL_COLOR, TABLE_LINE_COLOR } from "../../palette";
import { TABLE_DEFAULTS } from "./table.defaults";
import { cellFontWeight, offsets } from "./table.layout";
import { cellPart } from "./table-parts";
import type { TableElement } from "./table.types";

/**
 * White cells (a tinted header row, and each cell's own fill on top), thin grid lines, and each
 * cell's text centered vertically.
 */
export function drawTable(view: ElementView, el: TableElement): void {
  const xs = offsets(el.columns);
  const ys = offsets(el.rows);
  const g = view.graphics.clear().rect(0, 0, el.w, el.h).fill({ color: TABLE_CELL_COLOR });
  if (el.header && el.rows[0]) g.rect(0, 0, el.w, el.rows[0]).fill({ color: el.color });
  el.fills.forEach((fills, row) => {
    fills.forEach((color, column) => {
      const w = el.columns[column];
      const h = el.rows[row];
      if (color && w !== undefined && h !== undefined) {
        g.rect(xs[column]!, ys[row]!, w, h).fill({ color });
      }
    });
  });
  for (const x of xs.slice(1, -1)) g.moveTo(x, 0).lineTo(x, el.h);
  for (const y of ys.slice(1, -1)) g.moveTo(0, y).lineTo(el.w, y);
  g.rect(0, 0, el.w, el.h).stroke({ color: TABLE_LINE_COLOR, width: 1 });

  const { fontSize, padX } = TABLE_DEFAULTS;
  const keep = new Set<string>();
  el.cells.forEach((cells, row) => {
    cells.forEach((text, column) => {
      const width = el.columns[column];
      const height = el.rows[row];
      if (!text || width === undefined || height === undefined) return;
      const key = cellPart(row, column);
      keep.add(key);
      const node = view.setTextSlot(key, text, {
        fontSize,
        color: INK_COLOR,
        fontWeight: cellFontWeight(el, row) === 600 ? "600" : "400",
        wrapWidth: Math.max(1, width - padX * 2),
      });
      node.position.set(xs[column]! + padX, ys[row]! + (height - node.height) / 2);
    });
  });
  view.pruneTextSlots(keep);
}
