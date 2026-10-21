import {
  rectContainsPoint,
  type ElementInteraction,
  type InteractionQuery,
  type Point,
} from "@canvas";

import { isTable } from "./is-table";
import { TABLE_DEFAULTS } from "./table.defaults";
import { tableAddBars, tableGrips } from "./table.handles";
import { gridLineAt } from "./table.layout";
import { insertLine } from "./table-edits";
import { TableLineGesture } from "./table-line.gesture";
import { linePart } from "./table-parts";
import { TableReorderGesture } from "./table-reorder.gesture";
import type { TableElement } from "./table.types";

/**
 * What a press on a selected or hovered table grabs before selecting it: a "+" strip (adds a row
 * or column), a row or column grip (selects it, or drags it elsewhere), or, on a selected table,
 * a grid line (resizes the row or column before it).
 */
export function tableInteractionAt(
  table: TableElement,
  p: Point,
  { reach, zoom, selected, hovered }: InteractionQuery,
): ElementInteraction | null {
  if (!selected && !hovered) return null;

  const bar = tableAddBars(table, zoom).find((b) => rectContainsPoint(b.rect, p));
  if (bar) {
    return {
      cursor: "pointer",
      press: (ctx) => {
        const current = ctx.doc.get(table.id);
        if (!isTable(current)) return null;
        const at = bar.axis === "row" ? current.rows.length : current.columns.length;
        ctx.doc.checkpoint();
        ctx.doc.update(current.id, insertLine(current, bar.axis, at));
        ctx.setSelection([current.id]);
        return null;
      },
    };
  }

  const grip = tableGrips(table, zoom).find((g) => rectContainsPoint(g.rect, p, reach));
  if (grip) {
    return {
      cursor: "grab",
      press: (ctx, start) => {
        ctx.setSelection([table.id]);
        ctx.setPart(linePart(grip.axis, grip.index));
        return new TableReorderGesture(ctx, table, grip.axis, grip.index, start);
      },
    };
  }

  if (!selected) return null;
  const line = gridLineAt(table, p, TABLE_DEFAULTS.lineReachPx / zoom);
  if (!line) return null;
  return {
    cursor: line.axis === "row" ? "row-resize" : "col-resize",
    press: (ctx, start) => new TableLineGesture(ctx, table, line, start),
  };
}
