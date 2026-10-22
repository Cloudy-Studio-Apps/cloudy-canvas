import {
  fontFamilyList,
  measureTextBlock,
  textFont,
  type ElementTextStyle,
  type Size,
  type TextFont,
} from "@canvas";

import type { TextNodeElement } from "./text.types";

/** The color texts are drawn in when they have no visible solid fill. */
const NO_COLOR = "#000000";

/** The text's font, with the app's fonts as fallbacks while (or if) its own can't be had. */
export function fontOf(el: TextNodeElement): TextFont {
  return textFont(el.fontSize, {
    fontFamily: fontFamilyList(el.fontFamily),
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    lineHeight: el.lineHeight,
    letterSpacing: el.letterSpacing,
  });
}

/** How the text is laid out, shared by its drawing and the editor. */
export function textStyleOf(el: TextNodeElement): ElementTextStyle {
  const font = fontOf(el);
  const fill = el.fills.find((paint) => paint.visible && paint.type === "solid");
  return {
    fontSize: font.size,
    fontFamily: font.family,
    fontWeight: font.weight,
    fontStyle: font.style,
    lineHeight: font.lineHeight,
    letterSpacing: font.letterSpacing,
    color: fill?.type === "solid" ? fill.color : NO_COLOR,
    align: el.textAlign,
    vAlign: el.verticalAlign,
    padX: 0,
    padY: 0,
  };
}

/** The size its text gives it: both ways for auto width, the height for auto height, none fixed. */
export function textSize(el: TextNodeElement, text = el.text): Partial<Size> {
  const font = fontOf(el);
  const content = text || " ";
  if (el.autoResize === "width") {
    const { w, h } = measureTextBlock(content, font);
    return { w, h };
  }
  if (el.autoResize === "height") return { h: measureTextBlock(content, font, el.w).h };
  return {};
}
