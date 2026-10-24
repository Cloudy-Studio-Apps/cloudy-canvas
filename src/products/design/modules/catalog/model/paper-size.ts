import type { Size } from "@canvas";

import { FRAME_PRESETS } from "../../frame";
import type { PaperSize } from "./paper-size.types";

/** Brochure pages print a world unit as a point, as the paper frame presets are (A4 is 595 × 842). */
const MM_PER_UNIT = 25.4 / 72;
/** How far a frame may be off a paper preset's size and still match it, in world units. */
const MATCH_TOLERANCE = 1;

/** World units in millimetres on the printed page. */
export function unitsToMm(units: number): number {
  return units * MM_PER_UNIT;
}

/** Millimetres on the printed page in world units. */
export function mmToUnits(mm: number): number {
  return mm / MM_PER_UNIT;
}

/** The printed size of a page frame, and the paper preset it matches. */
export function paperSize({ w, h }: Size): PaperSize {
  const width = Math.round(unitsToMm(w));
  const height = Math.round(unitsToMm(h));
  const near = (a: number, b: number) => Math.abs(a - b) <= MATCH_TOLERANCE;
  for (const preset of FRAME_PRESETS) {
    if (preset.group !== "Paper") continue;
    const { w: pw, h: ph } = preset.size;
    if (near(w, pw) && near(h, ph)) return { width, height, name: `${preset.label} portrait` };
    if (near(w, ph) && near(h, pw)) return { width, height, name: `${preset.label} landscape` };
  }
  return { width, height, name: null };
}
