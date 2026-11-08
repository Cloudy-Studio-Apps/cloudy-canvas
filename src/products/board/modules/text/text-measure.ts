import { measureTextBlock, textFont, type ElementTextStyle } from "@canvas";

import type { LabelFit, TextElement, TextLook } from "./text.types";

/** The size of a label's unwrapped text in its font size, weight and style. */
export function measureLabel(
  text: string,
  fontSize: number,
  look: TextLook,
): { w: number; h: number } {
  const font = textFont(fontSize, { fontWeight: look.fontWeight, fontStyle: look.fontStyle });
  const { w, h } = measureTextBlock(text, font);
  return { w, h };
}

/**
 * The size a label takes: its unwrapped text's (auto width), or its own width and the height of
 * its text wrapped in it (fixed width).
 */
export function fitLabel(el: LabelFit): { w: number; h: number } {
  if (!el.wrap) return measureLabel(el.text, el.fontSize, el);
  const font = textFont(el.fontSize, { fontWeight: el.fontWeight, fontStyle: el.fontStyle });
  return { w: el.w, h: measureTextBlock(el.text, font, el.w).h };
}

/** How a label's text is drawn and edited. */
export function labelStyle(el: TextElement): ElementTextStyle {
  return {
    fontSize: el.fontSize,
    color: el.color,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    align: el.align ?? "left",
    vAlign: "top",
    padX: 0,
    padY: 0,
  };
}
