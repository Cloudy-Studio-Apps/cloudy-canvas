import type * as HarfBuzzModule from "harfbuzzjs";
import type { Font } from "harfbuzzjs";

import type { GlyphContour } from "@shared/core";

/** The HarfBuzz module, loaded the first time text is outlined. */
export type HarfBuzz = typeof HarfBuzzModule;

/** A face HarfBuzz has opened, with the outlines of the glyphs drawn so far (font units). */
export interface OpenFace {
  /** A HarfBuzz font of the face (its scale is its units per em). */
  font: Font;
  upem: number;
  ascender: number;
  descender: number;
  glyphs: Map<number, GlyphContour[]>;
}

/** Where a face stands: being read, open, or not to be had. */
export type FaceState =
  { status: "loading" } | { status: "failed" } | ({ status: "ready" } & OpenFace);
