import { fontFamilyList, textFont, type RichSpan, type TextFont } from "@canvas";

import type { Paint } from "../core";
import type { TextNodeElement, TextNodeRun, TextRunStyle } from "./text.types";

/** The color characters are drawn in when they have no visible solid fill: none. */
const NO_COLOR = null;

/** The text's own style as a run style (what runs override). */
export function baseRunStyle(el: TextNodeElement): Required<TextRunStyle> {
  return {
    fontFamily: el.fontFamily,
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    lineHeight: el.lineHeight,
    letterSpacing: el.letterSpacing,
    fills: el.fills,
    textDecoration: el.textDecoration,
    // A text's own typography is no range's style ("" reads as none).
    textStyle: "",
  };
}

/** The font a resolved style draws with, the app's fonts as fallbacks. */
export function fontOfStyle(style: Required<TextRunStyle>): TextFont {
  return textFont(style.fontSize, {
    fontFamily: fontFamilyList(style.fontFamily),
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
  });
}

/**
 * The text's styled spans as the engine's layout takes them: the stretches between run edges,
 * each with the text's style overridden by its run's.
 */
export function textSpans(
  el: TextNodeElement,
  text: string,
  runs: readonly TextNodeRun[],
): RichSpan[] {
  const base = baseRunStyle(el);
  const edges = new Set([0, text.length]);
  for (const run of runs) {
    if (run.start < text.length) edges.add(Math.max(0, run.start));
    if (run.end < text.length) edges.add(Math.max(0, run.end));
  }
  const points = [...edges].sort((a, b) => a - b);
  const spans: RichSpan[] = [];
  for (let i = 0; i + 1 < points.length || (i === 0 && points.length === 1); i++) {
    const start = points[i] ?? 0;
    const end = points[i + 1] ?? start;
    const own = runs.find((run) => run.start <= start && end <= run.end && run.end > start)?.style;
    const style = { ...base, ...own } as Required<TextRunStyle>;
    const color = solidColor(style.fills);
    spans.push({
      start,
      end,
      font: fontOfStyle(style),
      color: color?.color ?? NO_COLOR,
      alpha: color?.opacity ?? 1,
      decoration: style.textDecoration,
    });
  }
  return spans;
}

/** The first visible solid paint (what colors characters), if any. */
function solidColor(fills: readonly Paint[]): { color: string; opacity: number } | null {
  const fill = fills.find((paint) => paint.visible);
  return fill?.type === "solid" ? fill : null;
}
