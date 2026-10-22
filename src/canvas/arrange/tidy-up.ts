import { unionRects } from "../geometry";
import type { Point, Rect } from "../geometry.types";
import type { ArrangeItem } from "./arrange.types";

/** The spacing used when the items don't suggest one. */
const DEFAULT_GAP = 20;

/**
 * How far each item moves to tidy a rough arrangement into a grid: rows (items whose middle is
 * level with the row) of columns, each as wide as its widest item and each row as tall as its
 * tallest, with the median spacing between neighbors, from the top-left of the items' bounds.
 */
export function tidyUpOffsets(items: readonly ArrangeItem[]): Map<string, Point> {
  const offsets = new Map<string, Point>();
  const origin = unionRects(items.map((item) => item.rect));
  if (!origin || items.length < 2) return offsets;

  const rows = rowsOf(items);
  const gapX = median(
    rows.flatMap((row) =>
      gapsBetween(
        row.map((item) => item.rect),
        "x",
      ),
    ),
  );
  const gapY = median(
    gapsBetween(
      rows.map((row) => unionRects(row.map((i) => i.rect))!),
      "y",
    ),
  );
  const spaceX = gapX ?? gapY ?? DEFAULT_GAP;
  const spaceY = gapY ?? gapX ?? DEFAULT_GAP;

  const columns = Math.max(...rows.map((row) => row.length));
  const widths = Array.from({ length: columns }, (_, c) =>
    Math.max(0, ...rows.map((row) => row[c]?.rect.w ?? 0)),
  );
  let y = origin.y;
  for (const row of rows) {
    let x = origin.x;
    row.forEach((item, c) => {
      const dx = Math.round(x) - item.rect.x;
      const dy = Math.round(y) - item.rect.y;
      if (dx !== 0 || dy !== 0) offsets.set(item.id, { x: dx, y: dy });
      x += (widths[c] ?? 0) + spaceX;
    });
    y += Math.max(...row.map((item) => item.rect.h)) + spaceY;
  }
  return offsets;
}

/** Items grouped into rows, top to bottom, each sorted left to right. */
function rowsOf(items: readonly ArrangeItem[]): ArrangeItem[][] {
  const sorted = [...items].sort((a, b) => a.rect.y - b.rect.y);
  const rows: ArrangeItem[][] = [];
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

/** The positive spaces between consecutive rects on `axis` (they're in order on it). */
function gapsBetween(rects: readonly Rect[], axis: "x" | "y"): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i - 1]!;
    const b = rects[i]!;
    const gap = axis === "x" ? b.x - (a.x + a.w) : b.y - (a.y + a.h);
    if (gap > 0) gaps.push(gap);
  }
  return gaps;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return Math.round(sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2);
}
