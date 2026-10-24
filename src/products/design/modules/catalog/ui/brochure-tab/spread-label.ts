import type { BookLayout } from "@design";

/**
 * A book spread's heading in the page list: "Front cover", "Back cover", or the printed page
 * numbers ("Pages 2–3", "Page 4" for a side alone).
 */
export function spreadLabel(layout: BookLayout, spread: readonly number[]): string {
  const [first = 0, second] = spread;
  const alone = second === undefined;
  const isFront = alone && first === 0 && layout.offset === 1;
  const isBack = alone && first === layout.sides.length - 1 && first > 0;
  if (isFront) return "Front cover";
  if (isBack && (first + layout.offset) % 2 === 0) return "Back cover";
  return alone ? `Page ${first + 1}` : `Pages ${first + 1}–${second + 1}`;
}
