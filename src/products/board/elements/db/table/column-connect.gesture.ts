import type {
  CanvasPointer,
  ElementGesture,
  ElementPatch,
  Guide,
  Point,
  ToolContext,
} from "@canvas";

import { DB_CARD_DEFAULTS, rowTop } from "../card";
import { rowAt } from "./db-table.layout";
import { drawRelationPath } from "./draw-relation-path";
import { isDbTable } from "./is-db-table";
import { draftPath } from "./relation-path";
import type { ColumnRow } from "./column-connect.gesture.types";
import type { DbTableElement } from "./db-table.types";

const LINE_WIDTH_PX = 1.5;

/**
 * Drags a new relation out of a column handle. The end follows the pointer's screen position, so
 * auto-panning at the viewport edge or wheel-zooming mid-drag keeps it under the cursor, and tables
 * any distance away can be reached. Dropping on a row (or a header, meaning its primary key) links it.
 */
export class ColumnConnectGesture implements ElementGesture {
  private screen: Point;

  constructor(
    private readonly ctx: ToolContext,
    private readonly source: ColumnRow,
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
    const table = this.ctx.doc.get(this.source.table.id);
    const column = isDbTable(table) ? table.columns[this.source.row] : undefined;
    const targetColumn = target?.table.columns[target.row];
    if (!isDbTable(table) || !column || !target || !targetColumn) return;
    const ref = { tableId: target.table.id, columnId: targetColumn.id, kind: ">" as const };
    const patch: ElementPatch<DbTableElement> = {
      columns: table.columns.map((c) => (c.id === column.id ? { ...c, ref } : c)),
    };
    this.ctx.doc.checkpoint();
    this.ctx.doc.update(table.id, patch);
  }

  cancel(): void {
    this.ctx.autoPan(null);
    this.ctx.setGuide(null);
  }

  onCameraChange(): void {
    this.update();
  }

  /** Redraws the line to the pointer's world position (it moves with the camera too). */
  private update(): void {
    const end = this.world();
    this.ctx.setGuide(this.guide(end, this.targetAt(end)));
  }

  private guide(end: Point, target: ColumnRow | null): Guide {
    const { table, row } = this.source;
    return (g, { zoom, theme }) => {
      const width = LINE_WIDTH_PX / zoom;
      if (target) {
        g.rect(
          target.table.x,
          target.table.y + rowTop(target.row),
          target.table.w,
          DB_CARD_DEFAULTS.rowHeight,
        )
          .fill({ color: theme.selection, alpha: 0.14 })
          .stroke({ color: theme.selection, width });
      }
      drawRelationPath(g, draftPath(table, row, end));
      g.stroke({ color: theme.selection, width });
    };
  }

  private world(): Point {
    return this.ctx.camera.screenToWorld(this.screen);
  }

  private targetAt(world: Point): ColumnRow | null {
    const el = this.ctx.elementAt(world);
    if (!isDbTable(el)) return null;
    let row = rowAt(el, world);
    if (row === -1) row = el.columns.findIndex((column) => column.pk);
    if (row === null || row < 0) return null;
    if (el.id === this.source.table.id && row === this.source.row) return null;
    return { table: el, row };
  }
}
