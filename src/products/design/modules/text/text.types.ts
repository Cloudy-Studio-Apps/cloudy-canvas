import type {
  ElementDefaults,
  FontStyle,
  FontWeight,
  TextAlign,
  TextDecoration,
  TextRun,
} from "@canvas";

import type { DesignNode, Paint } from "../core";

export type { TextDecoration };

/**
 * How a text box follows its text: `width` grows both ways and never wraps, `height` keeps its
 * width and grows down, `none` keeps its size (Figma's auto width, auto height and fixed size).
 */
export type TextAutoResize = "width" | "height" | "none";

/** Where the text block sits in a box taller than it. */
export type TextVerticalAlign = "top" | "middle" | "bottom";

/**
 * What a range of a text sets over the text's own typography and look (Figma's mixed styles):
 * fields left out are the text's.
 */
export interface TextRunStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: number;
  letterSpacing?: number;
  /** Its paints; the first visible solid one colors its characters. */
  fills?: Paint[];
  textDecoration?: TextDecoration;
  /**
   * The text style this range uses (a style id): its typography follows the style, and writing
   * any of it by hand clears this (`unstyledRangePatch`).
   */
  textStyle?: string;
}

/** A styled range of a text. */
export type TextNodeRun = TextRun<TextRunStyle>;

/**
 * A text layer. Its color is its first visible solid fill; `runs` style ranges of it their own
 * way (mixed fonts, sizes, colors, decorations).
 */
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
  /** Underline or strikethrough for all of it (runs may set their own). */
  textDecoration: TextDecoration;
  /** Ranges styled their own way, sorted, without overlaps (`normalizeRuns`). */
  runs: TextNodeRun[];
}

/** The typography fields of a text, what the Typography section edits. */
export type TextTypography = Pick<
  TextNodeElement,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing"
>;

/** What a text style holds (`StyleRecord.value` of `styleType` "text"). */
export type TextStyleValue = TextTypography & Pick<TextNodeElement, "textDecoration">;

export interface TextDefaults extends ElementDefaults {
  fontSize: number;
  typography: TextTypography;
  color: string;
}
