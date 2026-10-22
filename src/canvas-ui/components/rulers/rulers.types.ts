import type { SnapAxis } from "@canvas";

/** The steps a ruler's ticks are drawn at, in world units. */
export interface RulerStep {
  /** Between labeled ticks. */
  major: number;
  /** Between the small ticks in between. */
  minor: number;
}

/** The colors a ruler is drawn with (CSS colors, from the `--canvas-ruler*` tokens). */
export interface RulerColors {
  background: string;
  foreground: string;
  border: string;
  selection: string;
}

/** What one ruler shows. */
export interface RulerView {
  /** `x`: the top ruler (world x along it); `y`: the left one. */
  axis: SnapAxis;
  /** The ruler's length, in CSS px. */
  length: number;
  /** The world value at the ruler's start (screen 0). */
  start: number;
  zoom: number;
  /** The selection's extent along the ruler, in world units, if anything is selected. */
  selection: readonly [number, number] | null;
  colors: RulerColors;
}

export interface RulerStripProps {
  axis: SnapAxis;
  /** Redrawn whenever this changes. */
  version: number;
  colors: RulerColors;
}
