import type { FontStyle, FontWeight } from "../../text/text-font.types";

/** One run of text as it's written: its font, place and paint. */
export interface TextRun {
  text: string;
  x: number;
  baseline: number;
  family: string;
  size: number;
  weight: FontWeight;
  style: FontStyle;
  letterSpacing: number;
  wordSpacing: number;
  hex: string;
  alpha: number;
}
