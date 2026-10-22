import { offsets } from "./table.layout";
import { TABLE_DEFAULTS } from "./table.defaults";
import type { TableAddBar, TableGrip } from "./table.handles.types";
import type { TableElement } from "./table.types";

/** The "+" strips on the right and below the table, in world units (sized in screen px). */
export function tableAddBars(el: TableElement, zoom: number): TableAddBar[] {
  const thickness = TABLE_DEFAULTS.addBarPx / zoom;
  const gap = TABLE_DEFAULTS.addGapPx / zoom;
  return [
    { axis: "column", rect: { x: el.x + el.w + gap, y: el.y, w: thickness, h: el.h } },
    { axis: "row", rect: { x: el.x, y: el.y + el.h + gap, w: el.w, h: thickness } },
  ];
}

/** One grip per row (left of the table) and per column (above it), centered on it. */
export function tableGrips(el: TableElement, zoom: number): TableGrip[] {
  const { gripOffsetPx, gripLengthPx, gripThicknessPx } = TABLE_DEFAULTS;
  const offset = gripOffsetPx / zoom;
  const thickness = gripThicknessPx / zoom;
  const grips: TableGrip[] = [];
  const ys = offsets(el.rows);
  el.rows.forEach((height, index) => {
    const length = Math.min(gripLengthPx / zoom, height * 0.6);
    const y = el.y + ys[index]! + (height - length) / 2;
    grips.push({
      axis: "row",
      index,
      rect: { x: el.x - offset - thickness / 2, y, w: thickness, h: length },
    });
  });
  const xs = offsets(el.columns);
  el.columns.forEach((width, index) => {
    const length = Math.min(gripLengthPx / zoom, width * 0.6);
    const x = el.x + xs[index]! + (width - length) / 2;
    grips.push({
      axis: "column",
      index,
      rect: { x, y: el.y - offset - thickness / 2, w: length, h: thickness },
    });
  });
  return grips;
}
