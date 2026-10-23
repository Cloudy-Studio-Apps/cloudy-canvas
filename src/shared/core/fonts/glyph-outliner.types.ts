import type { FontRequest } from "./font.types";

/** A point of a glyph's outline, in pixels (y grows down). */
export interface GlyphPoint {
  x: number;
  y: number;
}

/** A cubic piece of a glyph's outline, from where the previous one ended. */
export interface GlyphSegment {
  c1: GlyphPoint;
  c2: GlyphPoint;
  to: GlyphPoint;
}

/** One closed outline of a glyph (the canvas's `PathContour` has the same shape). */
export interface GlyphContour {
  start: GlyphPoint;
  segments: GlyphSegment[];
  closed: boolean;
}

/** A shaped glyph: its outlines placed at the pen (on the baseline), and how far it moves it. */
export interface ShapedGlyph {
  advance: number;
  contours: readonly GlyphContour[];
}

/** One line of text shaped in a face at a size, with the face's ascent and descent there. */
export interface ShapedLine {
  glyphs: readonly ShapedGlyph[];
  ascent: number;
  descent: number;
}

/**
 * Turns text into glyph outlines (kerning, ligatures and complex scripts shaped as the font says),
 * so text can be flattened or combined. A face is read the first time it's asked for: until then
 * `shape` answers `null`, and `onReady` reports when it can.
 */
export interface GlyphOutliner {
  /** Whether the face is read and can shape. */
  ready(font: FontRequest): boolean;
  /** One line of `text` at `size` pixels, or `null` while the face loads (or can't be had). */
  shape(font: FontRequest, text: string, size: number): ShapedLine | null;
  /** Calls `listener` with each face once it's ready. Returns the unsubscribe. */
  onReady(listener: (font: FontRequest) => void): () => void;
}

/** A font file and the index of the face in it (collections hold several). */
export interface FontData {
  bytes: Uint8Array;
  index: number;
}
