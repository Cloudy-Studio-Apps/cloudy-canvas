import type { FontStyle, FontWeight } from "@shared/core";

export type { FontStyle, FontWeight };

/** How the lines of a text line up. */
export type TextAlign = "left" | "center" | "right" | "justify";

/** Everything that decides how text is shaped: what drawing, measuring and the editor share. */
export interface TextFont {
  /** A CSS font family list, e.g. `"Roboto", sans-serif`. */
  family: string;
  size: number;
  weight: FontWeight;
  style: FontStyle;
  /** Line height as a multiple of the size. */
  lineHeight: number;
  /** Extra space between characters, in world units. */
  letterSpacing: number;
}

/** The parts of a `TextFont` an element may set; the rest are the app's defaults. */
export interface TextFontOptions {
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: number;
  letterSpacing?: number;
}
