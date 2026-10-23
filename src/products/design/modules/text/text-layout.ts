import {
  fontsVersion,
  layoutRichText,
  LruCache,
  type ElementTextStyle,
  type RichTextFrame,
  type RichTextLayout,
  type Size,
  type TextFont,
} from "@canvas";

import { baseRunStyle, fontOfStyle, textSpans } from "./text-spans";
import type { TextNodeElement, TextNodeRun } from "./text.types";

/** Layouts kept (drawing, sizing, outlines and the editor ask for the same ones). */
const LAYOUTS = new LruCache<string, RichTextLayout>(512);

/** The text's own font (runs may set others), the app's fonts as fallbacks. */
export function fontOf(el: TextNodeElement): TextFont {
  return fontOfStyle(baseRunStyle(el));
}

/** The text's own style as the engine's text style (its plain editor and labels). */
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
    color: fill?.type === "solid" ? fill.color : "#000000",
    align: el.textAlign,
    vAlign: el.verticalAlign,
    padX: 0,
    padY: 0,
  };
}

/** Where the text is laid out: its box, wrapping at its width unless it's auto width. */
export function textFrame(el: TextNodeElement): RichTextFrame {
  return {
    w: el.w,
    h: el.h,
    wrap: el.autoResize === "width" ? null : el.w,
    align: el.textAlign,
    vAlign: el.verticalAlign,
  };
}

/**
 * The text laid out as it's drawn (with `text` and `runs` in place of its own, while it's
 * edited): what its drawing, size, glyph outlines and the editor's caret all read.
 */
export function textLayout(
  el: TextNodeElement,
  text: string = el.text,
  runs: readonly TextNodeRun[] = el.runs,
): RichTextLayout {
  const frame = textFrame(el);
  const key = JSON.stringify([
    fontsVersion(),
    text,
    runs,
    frame,
    el.fontFamily,
    el.fontSize,
    el.fontWeight,
    el.fontStyle,
    el.lineHeight,
    el.letterSpacing,
    el.fills,
    el.textDecoration,
  ]);
  const known = LAYOUTS.get(key);
  if (known) return known;
  const layout = layoutRichText(text, textSpans(el, text, runs), frame);
  LAYOUTS.set(key, layout);
  return layout;
}

/**
 * The size its text gives it: both ways for auto width, the height for auto height, none fixed.
 */
export function textSize(
  el: TextNodeElement,
  text: string = el.text,
  runs: readonly TextNodeRun[] = el.runs,
): Partial<Size> {
  if (el.autoResize === "none") return {};
  const layout = textLayout(el, text || " ", runs);
  const h = Math.ceil(layout.h);
  if (el.autoResize === "width") return { w: Math.ceil(layout.w) + 2, h };
  return { h };
}
