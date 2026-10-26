import type { Random } from "../color";

/** A range to pick a number in: [lo, hi]. */
export type Range = readonly [number, number];

/** A gallery category: a recipe for palettes of a style, season or theme. */
export interface GalleryCategory {
  group: "Styles" | "Seasons" | "Themes";
  id: string;
  label: string;
  description: string;
  /** Five colors (`#RRGGBB`) from a random source. */
  generate: (random: Random) => string[];
}

/** Palettes whose colors share OKLCH ranges. */
export interface RangeRecipe {
  /** Lightness and chroma ranges. */
  l: Range;
  c: Range;
  /** Hue ranges in degrees (one picked per palette); every hue without. */
  hues?: readonly Range[];
  /** All five within this many degrees of one hue picked in `hues`. */
  spread?: number;
  /** Lightest first (default) or as generated. */
  sorted?: boolean;
}

/** One color per [lightness, chroma, hue] range set. */
export type ColorRanges = readonly (readonly [Range, Range, Range])[];
