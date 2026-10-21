import type { TextStyleOptions } from "pixi.js";

import { FONT_FAMILY, LINE_HEIGHT } from "../../document";
import type { ShapeTextOptions } from "./text-style.types";

/** Pixi text style matching the DOM text editor, so text doesn't jump when editing starts. */
export function shapeTextStyle({
  fontSize,
  color,
  wrapWidth,
  fontWeight = "400",
}: ShapeTextOptions): TextStyleOptions {
  return {
    fontFamily: FONT_FAMILY,
    fontSize,
    fontWeight,
    lineHeight: fontSize * LINE_HEIGHT,
    fill: color,
    wordWrap: wrapWidth !== undefined,
    wordWrapWidth: wrapWidth ?? 0,
    breakWords: true,
    whiteSpace: "pre",
  };
}
