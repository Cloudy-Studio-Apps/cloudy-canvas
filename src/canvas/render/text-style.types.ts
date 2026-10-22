import type { TextAlign, TextFontOptions } from "../text/text-font.types";

export interface CanvasTextOptions extends TextFontOptions {
  fontSize: number;
  color: string;
  /** Horizontal alignment of wrapped lines. Defaults to left. */
  align?: TextAlign;
  /** Wrap width in world units; omit for unwrapped text. */
  wrapWidth?: number;
}
