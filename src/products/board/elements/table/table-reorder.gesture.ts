import type { CanvasPointer, ElementGesture, Guide, ToolContext } from "@canvas";

import { isTable } from "./is-table";
import { offsets } from "./table.layout";
import { moveLine } from "./table-edits";
import { linePart } from "./table-parts";
import type { TableAxis, TableElement } from "./table.types";

const DRAG_THRESHOLD = 3; // screen px
const GUIDE_WIDTH_PX = 3;

/**
 * Pressing a row or column grip selects that row or column; dragging it past a few pixels moves
 * it to the slot nearest the pointer, shown by a line across the table.
 */
export class TableReorderGesture implements ElementGesture {
  private started = false;
  private slot: number;

  constructor(
    private readonly ctx: ToolContext,
    private readonly table: TableElement,
    private readonly axis: TableAxis,
    private readonly index: number,
    private readonly start: CanvasPointer,
  ) {
    this.slot = index;
  }

  move(p: CanvasPointer): void {
    if (!this.started) {
      const distance = Math.hypot(
        p.screen.x - this.start.screen.x,
        p.screen.y - this.start.screen.y,
      );
      if (distance < DRAG_THRESHOLD) return;
      this.started = true;
      this.ctx.setCursor("grabbing");
    }
    this.slot = this.slotAt(
      this.axis === "row" ? p.world.y - this.table.y : p.world.x - this.table.x,
    );
    this.ctx.setGuide(this.guide());
  }

  finish(): void {
    this.cancel();
    const table = this.ctx.doc.get(this.table.id);
    if (!this.started || !isTable(table)) return;
    // Dropping right before or after itself leaves it where it is.
    if (this.slot === this.index || this.slot === this.index + 1) return;
    const to = this.slot > this.index ? this.slot - 1 : this.slot;
    this.ctx.doc.checkpoint();
    this.ctx.doc.update(table.id, moveLine(table, this.axis, this.index, to));
    this.ctx.setPart(linePart(this.axis, to));
  }

  cancel(): void {
    this.ctx.setGuide(null);
  }

  /** The boundary (0 = before the first, n = after the last) nearest a local coordinate. */
  private slotAt(v: number): number {
    const bounds = offsets(this.axis === "row" ? this.table.rows : this.table.columns);
    let best = 0;
    bounds.forEach((at, i) => {
      if (Math.abs(at - v) < Math.abs(bounds[best]! - v)) best = i;
    });
    return best;
  }

  private guide(): Guide {
    const { x, y, w, h, rows, columns } = this.table;
    const at = offsets(this.axis === "row" ? rows : columns)[this.slot] ?? 0;
    return (g, { zoom, theme }) => {
      const width = GUIDE_WIDTH_PX / zoom;
      if (this.axis === "row") g.rect(x, y + at - width / 2, w, width);
      else g.rect(x + at - width / 2, y, width, h);
      g.fill({ color: theme.selection });
    };
  }
}
