import type { RulerStep } from "./rulers.types";

/** Labels sit at least this far apart, in screen px. */
const MIN_LABEL_GAP_PX = 50;
/** Small ticks per labeled step, by the step's leading digit. */
const PARTS: Record<number, number> = { 1: 10, 2: 4, 5: 5 };

/**
 * The ruler's steps at a zoom: the smallest 1, 2 or 5 × 10ⁿ world units (at least 1) whose labels
 * are `MIN_LABEL_GAP_PX` apart, split in 10, 4 or 5 small ticks.
 */
export function rulerStep(zoom: number): RulerStep {
  let power = 10 ** Math.floor(Math.log10(Math.max(MIN_LABEL_GAP_PX / zoom, 1)));
  for (;;) {
    for (const digit of [1, 2, 5]) {
      const major = digit * power;
      if (major * zoom >= MIN_LABEL_GAP_PX) return { major, minor: major / (PARTS[digit] ?? 10) };
    }
    power *= 10;
  }
}

/** A ruler's number: whole units, or up to two decimals. */
export function rulerLabel(value: number): string {
  return String(Math.round(value * 100) / 100);
}
