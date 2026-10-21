import {
  DB_BODY_COLOR,
  DB_FONT_SIZE,
  DB_HEADER_H,
  DB_PADDING_X,
  DB_ROW_H,
  formatColumnType,
  INK_COLOR,
  MUTED_INK_COLOR,
  PAPER_SHADOW_COLOR,
  type DbColumn,
  type DbTableShape,
} from "../../document";
import { rowTop } from "../../db";
import { drawNoteBubble } from "./draw-note-bubble";
import { centerTextTop } from "./center-text";
import type { ShapeView } from "./shape-view";

const BADGE_FONT_SIZE = 10;
const BADGE_W = 22;

/** A table card: colored header with the name, then one row per column (name, type, badge). */
export function drawDbTable(view: ShapeView, shape: DbTableShape): void {
  const { w, h, columns } = shape;
  const g = view.graphics
    .clear()
    .rect(1, 3, w - 2, h)
    .fill({ color: PAPER_SHADOW_COLOR, alpha: 0.07 })
    .rect(0, 0, w, h)
    .fill({ color: DB_BODY_COLOR })
    .rect(0, 0, w, DB_HEADER_H)
    .fill({ color: shape.headerColor });
  for (let row = 1; row < columns.length; row++) {
    g.moveTo(0, rowTop(row)).lineTo(w, rowTop(row));
  }
  g.stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.06, width: 1 })
    .rect(0, 0, w, h)
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.16, width: 1, alignment: 1 });

  const keep = new Set<string>(["name"]);
  const name = view.setTextSlot("name", shape.name, {
    fontSize: DB_FONT_SIZE + 1,
    color: INK_COLOR,
    fontWeight: "600",
  });
  name.position.set(DB_PADDING_X, centerTextTop(DB_HEADER_H, DB_FONT_SIZE + 1));

  if (shape.indexes.length > 0) {
    keep.add("indexes");
    const label = view.setTextSlot("indexes", `${shape.indexes.length} idx`, {
      fontSize: BADGE_FONT_SIZE,
      color: MUTED_INK_COLOR,
      fontWeight: "600",
    });
    label.position.set(w - DB_PADDING_X - label.width, centerTextTop(DB_HEADER_H, BADGE_FONT_SIZE));
  }
  const indexed = new Set(
    shape.indexes.flatMap((index) =>
      index.parts.flatMap((part) => (part.kind === "column" ? [part.columnId] : [])),
    ),
  );

  if (columns.length === 0) {
    keep.add("empty");
    const empty = view.setTextSlot("empty", "No columns", {
      fontSize: DB_FONT_SIZE,
      color: MUTED_INK_COLOR,
    });
    empty.position.set(DB_PADDING_X, rowTop(0) + centerTextTop(DB_ROW_H, DB_FONT_SIZE));
  }

  columns.forEach((column, row) => {
    const top = rowTop(row) + centerTextTop(DB_ROW_H, DB_FONT_SIZE);
    const nameKey = `${row}:name`;
    const typeKey = `${row}:type`;
    keep.add(nameKey).add(typeKey);

    view
      .setTextSlot(nameKey, column.name, {
        fontSize: DB_FONT_SIZE,
        color: INK_COLOR,
        fontWeight: column.pk ? "600" : "400",
      })
      .position.set(DB_PADDING_X, top);
    const type = view.setTextSlot(typeKey, formatColumnType(column), {
      fontSize: DB_FONT_SIZE,
      color: MUTED_INK_COLOR,
    });
    type.position.set(w - DB_PADDING_X - BADGE_W - type.width, top);

    if (column.note) {
      // A dot marks columns that have a note.
      g.circle(DB_PADDING_X / 2, rowTop(row) + DB_ROW_H / 2, 2).fill({ color: MUTED_INK_COLOR });
    }

    const badge = badgeFor(column, indexed.has(column.id));
    if (!badge) return;
    const badgeKey = `${row}:badge`;
    keep.add(badgeKey);
    view
      .setTextSlot(badgeKey, badge, {
        fontSize: BADGE_FONT_SIZE,
        color: column.pk ? INK_COLOR : MUTED_INK_COLOR,
        fontWeight: "600",
      })
      .position.set(
        w - DB_PADDING_X - BADGE_W + 4,
        rowTop(row) + centerTextTop(DB_ROW_H, BADGE_FONT_SIZE),
      );
  });

  for (const key of drawNoteBubble(view, shape)) keep.add(key);
  view.pruneTextSlots(keep);
}

/** The most important constraint, shown at the end of the row. */
function badgeFor(column: DbColumn, indexed: boolean): string | null {
  if (column.pk) return "PK";
  if (column.ref) return "FK";
  if (column.unique) return "UQ";
  if (indexed) return "IX";
  if (column.notNull) return "NN";
  return null;
}
