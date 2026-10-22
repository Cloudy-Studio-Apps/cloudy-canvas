import type { ElementDefaults, FontStyle, FontWeight, TextAlign } from "@canvas";

import type { DesignNode } from "../core";

/**
 * How a text box follows its text: `width` grows both ways and never wraps, `height` keeps its
 * width and grows down, `none` keeps its size (Figma's auto width, auto height and fixed size).
 */
export type TextAutoResize = "width" | "height" | "none";

/** Where the text block sits in a box taller than it. */
export type TextVerticalAlign = "top" | "middle" | "bottom";

/** A text layer. Its color is its first visible solid fill. */
export interface TextNodeElement extends DesignNode {
  type: "text";
  text: string;
  /** A family name, e.g. "Roboto" (installed or from Google Fonts). */
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  /** Line height as a multiple of the font size. */
  lineHeight: number;
  /** Extra space between characters, in world units. */
  letterSpacing: number;
  textAlign: TextAlign;
  verticalAlign: TextVerticalAlign;
  autoResize: TextAutoResize;
}

/** The typography fields of a text, what the Typography section edits. */
export type TextTypography = Pick<
  TextNodeElement,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing"
>;

export interface TextDefaults extends ElementDefaults {
  fontSize: number;
  typography: TextTypography;
  color: string;
}
