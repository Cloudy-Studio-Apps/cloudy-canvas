import {
  DB_BODY_COLOR,
  DB_FONT_SIZE,
  DB_HEADER_H,
  DB_PADDING_X,
  DB_ROW_H,
  INK_COLOR,
  LINE_HEIGHT,
  MUTED_INK_COLOR,
  PAPER_SHADOW_COLOR,
  type DbColumn,
  type DbTableShape,
} from "../../document";
import { rowTop } from "../../db";
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
  name.position.set(DB_PADDING_X, centered(DB_HEADER_H, DB_FONT_SIZE + 1));

  if (columns.length === 0) {
    keep.add("empty");
    const empty = view.setTextSlot("empty", "No columns", {
      fontSize: DB_FONT_SIZE,
      color: MUTED_INK_COLOR,
    });
    empty.position.set(DB_PADDING_X, rowTop(0) + centered(DB_ROW_H, DB_FONT_SIZE));
  }

  columns.forEach((column, row) => {
    const top = rowTop(row) + centered(DB_ROW_H, DB_FONT_SIZE);
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
    const type = view.setTextSlot(typeKey, column.type, {
      fontSize: DB_FONT_SIZE,
      color: MUTED_INK_COLOR,
    });
    type.position.set(w - DB_PADDING_X - BADGE_W - type.width, top);

    const badge = badgeFor(column);
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
        rowTop(row) + centered(DB_ROW_H, BADGE_FONT_SIZE),
      );
  });

  view.pruneTextSlots(keep);
}

/** The most important constraint, shown at the end of the row. */
function badgeFor(column: DbColumn): string | null {
  if (column.pk) return "PK";
  if (column.ref) return "FK";
  if (column.unique) return "UQ";
  if (column.notNull) return "NN";
  return null;
}

/** Top offset that vertically centers one line of text in a box of `height`. */
function centered(height: number, fontSize: number): number {
  return (height - fontSize * LINE_HEIGHT) / 2;
}
