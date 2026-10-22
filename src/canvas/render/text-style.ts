import type { TextStyleOptions } from "pixi.js";

import { textFont } from "../text/text-font";
import type { CanvasTextOptions } from "./text-style.types";

/** Pixi text style matching the DOM text editor, so text doesn't jump when editing starts. */
export function canvasTextStyle(options: CanvasTextOptions): TextStyleOptions {
  const font = textFont(options.fontSize, options);
  return {
    fontFamily: font.family,
    fontSize: font.size,
    fontWeight: font.weight,
    fontStyle: font.style,
    letterSpacing: font.letterSpacing,
    align: options.align ?? "left",
    lineHeight: font.size * font.lineHeight,
    fill: options.color,
    wordWrap: options.wrapWidth !== undefined,
    wordWrapWidth: options.wrapWidth ?? 0,
    breakWords: true,
    whiteSpace: "pre",
  };
}
