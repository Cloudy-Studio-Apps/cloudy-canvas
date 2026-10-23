import type { Rect } from "../geometry.types";

/**
 * Items grouped into rows (items whose middle is level with the row), top to bottom, each sorted
 * left to right.
 */
export function readingRows<T extends { rect: Rect }>(items: readonly T[]): T[][] {
  const sorted = [...items].sort((a, b) => a.rect.y - b.rect.y);
  const rows: T[][] = [];
  let bottom = -Infinity;
  for (const item of sorted) {
    const middle = item.rect.y + item.rect.h / 2;
    const row = rows[rows.length - 1];
    if (row && middle < bottom) {
      row.push(item);
      bottom = Math.max(bottom, item.rect.y + item.rect.h);
    } else {
      rows.push([item]);
      bottom = item.rect.y + item.rect.h;
    }
  }
  return rows.map((row) => row.sort((a, b) => a.rect.x - b.rect.x));
}

/** Items in reading order: row by row, left to right (e.g. the frames N steps through). */
export function readingOrder<T extends { rect: Rect }>(items: readonly T[]): T[] {
  return readingRows(items).flat();
}
