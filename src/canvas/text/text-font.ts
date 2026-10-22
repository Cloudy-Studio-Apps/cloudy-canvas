import { ELEMENT_DEFAULTS } from "../elements/element.defaults";
import type { TextFont, TextFontOptions } from "./text-font.types";

/** The font for `size` with an element's options, the app's defaults filling the rest. */
export function textFont(size: number, options: TextFontOptions = {}): TextFont {
  return {
    family: options.fontFamily ?? ELEMENT_DEFAULTS.fontFamily,
    size,
    weight: options.fontWeight ?? "400",
    style: options.fontStyle ?? "normal",
    lineHeight: options.lineHeight ?? ELEMENT_DEFAULTS.lineHeight,
    letterSpacing: options.letterSpacing ?? 0,
  };
}

/** The CSS `font` shorthand (canvas measuring, `document.fonts.load`). */
export function cssFont({ style, weight, size, family }: TextFont): string {
  return `${style} ${weight} ${size}px ${family}`;
}

/** A family name as CSS wants it in a list: quoted, the app's fonts as fallbacks. */
export function fontFamilyList(family: string): string {
  return `"${family.replace(/"/g, "")}", ${ELEMENT_DEFAULTS.fontFamily}`;
}
