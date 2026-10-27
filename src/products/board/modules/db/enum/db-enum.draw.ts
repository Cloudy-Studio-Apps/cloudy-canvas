import { centerTextTop, type ElementView } from "@canvas";

import { INK_COLOR, MUTED_INK_COLOR } from "../../../palette";
import { DB_CARD_DEFAULTS, drawCardFrame, rowTop } from "../card";
import type { DbEnumElement } from "./db-enum.types";
import { t } from "../db.i18n";

const {
  fontSize: DB_FONT_SIZE,
  headerHeight: DB_HEADER_H,
  rowHeight: DB_ROW_H,
  paddingX: DB_PADDING_X,
  badgeFontSize: TAG_FONT_SIZE,
} = DB_CARD_DEFAULTS;

/** An enum card: header with an "enum" tag and the name, then one row per value. */
export function drawDbEnum(view: ElementView, el: DbEnumElement): void {
  const { values } = el;
  const g = drawCardFrame(view.graphics, el, values.length);

  const keep = new Set<string>(["tag", "name"]);
  const tag = view.setTextSlot("tag", "enum", {
    fontSize: TAG_FONT_SIZE,
    color: MUTED_INK_COLOR,
    fontWeight: "600",
  });
  tag.position.set(DB_PADDING_X, centerTextTop(DB_HEADER_H, TAG_FONT_SIZE));
  view
    .setTextSlot("name", el.name, {
      fontSize: DB_FONT_SIZE + 1,
      color: INK_COLOR,
      fontWeight: "600",
    })
    .position.set(DB_PADDING_X + tag.width + 6, centerTextTop(DB_HEADER_H, DB_FONT_SIZE + 1));

  if (values.length === 0) {
    keep.add("empty");
    view
      .setTextSlot("empty", t("canvas.noValues"), {
        fontSize: DB_FONT_SIZE,
        color: MUTED_INK_COLOR,
      })
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
