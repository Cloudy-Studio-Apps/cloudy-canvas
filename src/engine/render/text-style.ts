import type { TextStyleOptions } from "pixi.js";

import { FONT_FAMILY, LINE_HEIGHT } from "../elements/element-defaults";
import type { CanvasTextOptions } from "./text-style.types";

/** Pixi text style matching the DOM text editor, so text doesn't jump when editing starts. */
export function canvasTextStyle({
  fontSize,
  color,
  wrapWidth,
  fontWeight = "400",
  align = "left",
}: CanvasTextOptions): TextStyleOptions {
  return {
    fontFamily: FONT_FAMILY,
    fontSize,
    fontWeight,
    align,
    lineHeight: fontSize * LINE_HEIGHT,
    fill: color,
    wordWrap: wrapWidth !== undefined,
    wordWrapWidth: wrapWidth ?? 0,
    breakWords: true,
    whiteSpace: "pre",
  };
}
