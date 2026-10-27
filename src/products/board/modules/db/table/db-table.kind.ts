import { rectContainsPoint, type ElementView, type InteractionQuery, type Point } from "@canvas";

import { DB_CARD_DEFAULTS, DbCardKind } from "../card";
import { canonicalTypeName } from "./type-aliases";
import { formatColumnType, splitColumnType } from "./column-type";
import { columnAnchor } from "./db-table.layout";
import { drawDbTable } from "./db-table.draw";
import { tableInteractionAt } from "./db-table.interactions";
import type { DbColumn, DbTableElement } from "./db-table.types";
import { noteBubbleLayout } from "./note-bubble.layout";
import { t } from "../db.i18n";

/** A database table: a card with one row per column, its relations drawn by the board's links. */
export class DbTableKind extends DbCardKind<DbTableElement> {
  readonly type = "db-table";
  readonly label = t("table.label");
  readonly description = t("table.description");
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

  /** The table's name over a header and one row per column. */
  override rows(el: DbTableElement): string[][] {
    return [
      [el.name],
      ["Column", "Type", "Primary key", "Not null", "Unique", "Default", "Note"],
      ...el.columns.map((column) => [
        column.name,
        formatColumnType(column),
        yesNo(column.pk),
        yesNo(column.notNull),
        yesNo(column.unique),
        column.default ?? "",
        column.note,
      ]),
    ];
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

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}
