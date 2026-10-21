import { rectContainsPoint, type ElementView, type InteractionQuery, type Point } from "@canvas";

import { DB_CARD_DEFAULTS, DbCardKind } from "../card";
import { canonicalTypeName } from "./type-aliases";
import { splitColumnType } from "./column-type";
import { columnAnchor } from "./db-table.layout";
import { drawDbTable } from "./db-table.draw";
import { tableInteractionAt } from "./db-table.interactions";
import type { DbColumn, DbTableElement } from "./db-table.types";
import { noteBubbleLayout } from "./note-bubble.layout";

/** A database table: a card with one row per column, its relations drawn by the board's links. */
export class DbTableKind extends DbCardKind<DbTableElement> {
  readonly type = "db-table";
  readonly label = "Database table";
  readonly description = "A table of the board's database schema, edited visually or as DBML.";
  override readonly defaults = DB_CARD_DEFAULTS;

  draw(view: ElementView, el: DbTableElement): void {
    drawDbTable(view, el);
  }

  /** A table's note bubbles belong to it: clicking one selects (and drags) the table. */
  override hitTest(el: DbTableElement, p: Point, tolerance: number): boolean {
    const bubbles = noteBubbleLayout(el)?.bubbles ?? [];
    return (
      bubbles.some((bubble) => rectContainsPoint(bubble.rect, p, tolerance)) ||
      super.hitTest(el, p, tolerance)
    );
  }

  override interactionAt(el: DbTableElement, p: Point, query: InteractionQuery) {
    return tableInteractionAt(el, p, query);
  }

  /** A handle on both ends of every column row, to drag relations out of. */
  override handles(el: DbTableElement): Point[] {
    return el.columns.flatMap((_, row) => [
      columnAnchor(el, row, "left"),
      columnAnchor(el, row, "right"),
    ]);
  }

  override fillDefaults(el: DbTableElement): DbTableElement {
    return {
      ...el,
      columns: el.columns.map(fillColumnDefaults),
      indexes: el.indexes ?? [],
      noteHidden: el.noteHidden ?? false,
    };
  }
}

/**
 * Columns saved before `typeArgs` existed kept the arguments in the type (`varchar(255)`), and
 * older types may use an alias (`int`).
 */
function fillColumnDefaults(column: DbColumn): DbColumn {
  if (column.typeArgs === undefined) return { ...column, ...splitColumnType(column.type) };
  const type = canonicalTypeName(column.type);
  return type === column.type ? column : { ...column, type };
}
