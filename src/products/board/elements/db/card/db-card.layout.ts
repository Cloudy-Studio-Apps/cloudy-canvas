import { ELEMENT_DEFAULTS } from "@canvas";

import { DB_CARD_DEFAULTS } from "./db-card.defaults";

/** Top of a row, relative to the card. */
export function rowTop(row: number): number {
  return DB_CARD_DEFAULTS.headerHeight + row * DB_CARD_DEFAULTS.rowHeight;
}

/** Height of a card with `rows` rows (an empty card keeps one row for its placeholder). */
export function cardHeight(rows: number): number {
  return rowTop(Math.max(rows, 1));
}

/** Top offset that vertically centers one line of text in a box of `height`. */
export function centerTextTop(height: number, fontSize: number): number {
  return (height - fontSize * ELEMENT_DEFAULTS.lineHeight) / 2;
}
