import { rowAt } from "../db";
import { isDbTable } from "../document";
import type { Point } from "../geometry.types";
import type { DropTarget } from "../render";
import type { CanvasPointer, TableHandle, ToolContext } from "./tool.types";

/**
 * Drags a new relation out of a column handle. The end follows the pointer's screen position, so
 * auto-panning at the viewport edge or wheel-zooming mid-drag keeps it under the cursor, and tables
 * any distance away can be reached. Dropping on a row (or a header, meaning its primary key) links it.
 */
export class ConnectGesture {
  private screen: Point;

  constructor(
    private readonly ctx: ToolContext,
    private readonly source: TableHandle,
    start: CanvasPointer,
  ) {
    this.screen = start.screen;
    this.update();
  }

  move(p: CanvasPointer): void {
    this.screen = p.screen;
    this.update();
    this.ctx.autoPan(p.screen, () => this.update());
  }

  finish(): void {
    const target = this.targetAt(this.world());
    this.cancel();
    const column = this.source.table.columns[this.source.row];
    const targetColumn = target?.table.columns[target.row];
    if (!column || !target || !targetColumn) return;
    this.ctx.db.setColumnRef(this.source.table.id, column.id, {
      tableId: target.table.id,
      columnId: targetColumn.id,
      kind: ">",
    });
  }

  cancel(): void {
    this.ctx.autoPan(null);
    this.ctx.setDraftRelation(null, null);
  }

  /** Re-reads the pointer's world position, e.g. after the camera moved. */
  update(): void {
    const end = this.world();
    this.ctx.setDraftRelation(
      { tableId: this.source.table.id, row: this.source.row, end },
      this.targetAt(end),
    );
  }

  private world(): Point {
    return this.ctx.camera.screenToWorld(this.screen);
  }

  private targetAt(world: Point): DropTarget | null {
    const shape = this.ctx.shapeAt(world);
    if (!isDbTable(shape)) return null;
    let row = rowAt(shape, world);
    if (row === -1) row = shape.columns.findIndex((column) => column.pk);
    if (row === null || row < 0) return null;
    if (shape.id === this.source.table.id && row === this.source.row) return null;
    return { table: shape, row };
  }
}
