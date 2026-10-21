import type { CanvasPointer, ElementGesture, ToolContext } from "@canvas";

import { isTable } from "./is-table";
import { resizeLine } from "./table-edits";
import type { TableLine } from "./table.layout.types";
import type { TableElement } from "./table.types";

/** Drags a grid line to resize the row or column before it, as one undo step. */
export class TableLineGesture implements ElementGesture {
  private readonly origin: TableElement | null;
  private started = false;

  constructor(
    private readonly ctx: ToolContext,
    table: TableElement,
    private readonly line: TableLine,
    private readonly start: CanvasPointer,
  ) {
    const stored = ctx.doc.get(table.id);
    this.origin = isTable(stored) ? stored : null;
  }

  move(p: CanvasPointer): void {
    const origin = this.origin;
    if (!origin) return;
    if (!this.started) {
      this.started = true;
      this.ctx.doc.checkpoint();
    }
    const { axis, index } = this.line;
    const delta = axis === "row" ? p.world.y - this.start.world.y : p.world.x - this.start.world.x;
    const size = (axis === "row" ? origin.rows : origin.columns)[index] ?? 0;
    // Always from the origin, so narrowing a column and widening it back restores its rows.
    this.ctx.doc.update(origin.id, resizeLine(origin, axis, index, size + delta));
  }

  finish(): void {}

  cancel(): void {}
}
