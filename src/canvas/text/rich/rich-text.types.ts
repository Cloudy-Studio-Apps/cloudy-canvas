import type { TextAlign, TextFont } from "../text-font.types";

/** A line drawn under or through a span's text. */
export type TextDecoration = "none" | "underline" | "strikethrough";

/**
 * One styled stretch of a text as it's drawn: characters `start` to `end` in `font`, in `color`
 * at `alpha` (`null`: not drawn, e.g. no visible fill), with its decoration.
 */
export interface RichSpan {
  start: number;
  end: number;
  font: TextFont;
  color: string | null;
  alpha: number;
  decoration: TextDecoration;
}

/** Where a text is laid out: its box, where lines wrap (`null`: they don't) and alignment. */
export interface RichTextFrame {
  w: number;
  h: number;
  wrap: number | null;
  align: TextAlign;
  vAlign: "top" | "middle" | "bottom";
}

/** A piece of a line in one span: a word or a run of spaces (or part of one, where spans change). */
export interface RichFragment {
  start: number;
  end: number;
  /** Its span's index in `RichTextLayout.spans`. */
  span: number;
  /** Left edge from the text box's left, and width (justified spaces are wider). */
  x: number;
  w: number;
  /** Whether it's only spaces. */
  space: boolean;
}

/** One laid-out line: its characters (`end` before its line break), place and fragments. */
export interface RichLine {
  start: number;
  end: number;
  /** Top from the text box's top, and height. */
  top: number;
  height: number;
  /** The baseline, from the text box's top. */
  baseline: number;
  /** Left edge of its content and its width (trailing spaces left out). */
  x: number;
  w: number;
  fragments: RichFragment[];
}

/** A text laid out in its frame: what drawing, sizing, outlines and the editor all read. */
export interface RichTextLayout {
  text: string;
  spans: readonly RichSpan[];
  frame: RichTextFrame;
  lines: RichLine[];
  /** The widest line's width and the lines' total height. */
  w: number;
  h: number;
}
