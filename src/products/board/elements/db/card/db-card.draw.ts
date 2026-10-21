import type { Graphics } from "pixi.js";

import { DB_BODY_COLOR, PAPER_SHADOW_COLOR } from "../../../palette";
import { rowTop } from "./db-card.layout";
import { DB_CARD_DEFAULTS } from "./db-card.defaults";
import type { DbCardElement } from "./db-card.types";

/** The card behind a table or enum: shadow, body, colored header and row separators. */
export function drawCardFrame(g: Graphics, el: DbCardElement, rows: number): Graphics {
  const { w, h } = el;
  g.clear()
    .rect(1, 3, w - 2, h)
    .fill({ color: PAPER_SHADOW_COLOR, alpha: 0.07 })
    .rect(0, 0, w, h)
    .fill({ color: DB_BODY_COLOR })
    .rect(0, 0, w, DB_CARD_DEFAULTS.headerHeight)
    .fill({ color: el.headerColor });
  for (let row = 1; row < rows; row++) g.moveTo(0, rowTop(row)).lineTo(w, rowTop(row));
  return g
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.06, width: 1 })
    .rect(0, 0, w, h)
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.16, width: 1, alignment: 1 });
}
