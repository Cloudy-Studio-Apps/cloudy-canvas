import type { TextStyleOptions } from "pixi.js";

import { FONT_FAMILY, LINE_HEIGHT } from "../../document";

export interface ShapeTextOptions {
  fontSize: number;
  color: string;
  /** Wrap width in world units; omit for unwrapped text. */
  wrapWidth?: number;
}

/** Pixi text style matching the DOM text editor, so text doesn't jump when editing starts. */
export function shapeTextStyle({ fontSize, color, wrapWidth }: ShapeTextOptions): TextStyleOptions {
  return {
    fontFamily: FONT_FAMILY,
    fontSize,
    lineHeight: fontSize * LINE_HEIGHT,
    fill: color,
    wordWrap: wrapWidth !== undefined,
    wordWrapWidth: wrapWidth ?? 0,
    breakWords: true,
    whiteSpace: "pre",
  };
}
