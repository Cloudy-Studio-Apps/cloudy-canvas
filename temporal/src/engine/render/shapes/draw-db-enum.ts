import {
  DB_BODY_COLOR,
  DB_FONT_SIZE,
  DB_HEADER_H,
  DB_PADDING_X,
  DB_ROW_H,
  INK_COLOR,
  MUTED_INK_COLOR,
  PAPER_SHADOW_COLOR,
  type DbEnumShape,
} from "../../document";
import { rowTop } from "../../db";
import { centerTextTop } from "./center-text";
import type { ShapeView } from "./shape-view";

const TAG_FONT_SIZE = 10;

/** An enum card: header with an "enum" tag and the name, then one row per value. */
export function drawDbEnum(view: ShapeView, shape: DbEnumShape): void {
  const { w, h, values } = shape;
  const g = view.graphics
    .clear()
    .rect(1, 3, w - 2, h)
    .fill({ color: PAPER_SHADOW_COLOR, alpha: 0.07 })
    .rect(0, 0, w, h)
    .fill({ color: DB_BODY_COLOR })
    .rect(0, 0, w, DB_HEADER_H)
    .fill({ color: shape.headerColor });
  for (let row = 1; row < values.length; row++) g.moveTo(0, rowTop(row)).lineTo(w, rowTop(row));
  g.stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.06, width: 1 })
    .rect(0, 0, w, h)
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.16, width: 1, alignment: 1 });

  const keep = new Set<string>(["tag", "name"]);
  const tag = view.setTextSlot("tag", "enum", {
    fontSize: TAG_FONT_SIZE,
    color: MUTED_INK_COLOR,
    fontWeight: "600",
  });
  tag.position.set(DB_PADDING_X, centerTextTop(DB_HEADER_H, TAG_FONT_SIZE));
  view
    .setTextSlot("name", shape.name, {
      fontSize: DB_FONT_SIZE + 1,
      color: INK_COLOR,
      fontWeight: "600",
    })
    .position.set(DB_PADDING_X + tag.width + 6, centerTextTop(DB_HEADER_H, DB_FONT_SIZE + 1));

  if (values.length === 0) {
    keep.add("empty");
    view
      .setTextSlot("empty", "No values", { fontSize: DB_FONT_SIZE, color: MUTED_INK_COLOR })
      .position.set(DB_PADDING_X, rowTop(0) + centerTextTop(DB_ROW_H, DB_FONT_SIZE));
  }
  values.forEach((value, row) => {
    const key = `${row}:value`;
    keep.add(key);
    view
      .setTextSlot(key, value.name, { fontSize: DB_FONT_SIZE, color: INK_COLOR })
      .position.set(DB_PADDING_X, rowTop(row) + centerTextTop(DB_ROW_H, DB_FONT_SIZE));
    if (value.note) {
      g.circle(DB_PADDING_X / 2, rowTop(row) + DB_ROW_H / 2, 2).fill({ color: MUTED_INK_COLOR });
    }
  });
  view.pruneTextSlots(keep);
}
