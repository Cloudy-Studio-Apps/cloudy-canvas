import { DB_CARD_DEFAULTS } from "./db-card.defaults";

/** Top of a row, relative to the card. */
export function rowTop(row: number): number {
  return DB_CARD_DEFAULTS.headerHeight + row * DB_CARD_DEFAULTS.rowHeight;
}

/** Height of a card with `rows` rows (an empty card keeps one row for its placeholder). */
export function cardHeight(rows: number): number {
  return rowTop(Math.max(rows, 1));
}
