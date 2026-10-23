import {
  normalizeRuns,
  sameRunStyle,
  type ElementPatch,
  type RichTextSpec,
  type TextStyleShortcut,
} from "@canvas";

import { textLayout, textSize } from "./text-layout";
import { baseRunStyle } from "./text-spans";
import type { TextNodeElement, TextNodeRun, TextRunStyle } from "./text.types";

/** A weight this heavy or more counts as bold for Ctrl+B. */
const BOLD_FROM = 600;

/** How a design text is edited as rich text: its runs, layout and what writes them. */
export const TEXT_RICH: RichTextSpec<TextNodeElement, TextRunStyle> = {
  runs: (el) => el.runs,
  layout: (el, text, runs) => textLayout(el, text, runs),
  apply: (el, text, runs) => textContentPatch(el, text, runs),
  shortcut: (el, shortcut, at) => toggledStyle({ ...baseRunStyle(el), ...at }, shortcut),
};

/**
 * What writes `text` with `runs` (normalized) and the size they give the text, or `null` when
 * nothing changes.
 */
export function textContentPatch(
  el: TextNodeElement,
  text: string,
  runs: readonly TextNodeRun[],
): ElementPatch<TextNodeElement> | null {
  const normalized = normalizeRuns(runs, text.length);
  const same =
    text === el.text &&
    normalized.length === el.runs.length &&
    normalized.every((run, i) => {
      const own = el.runs[i];
      return (
        own && own.start === run.start && own.end === run.end && sameRunStyle(own.style, run.style)
      );
    });
  if (same) return null;
  return { text, runs: normalized, ...textSize(el, text, normalized) };
}

/** The style a shortcut sets over a range whose style starts as `at`. */
function toggledStyle(
  at: Required<TextRunStyle>,
  shortcut: TextStyleShortcut,
): Partial<TextRunStyle> {
  switch (shortcut) {
    case "bold":
      return { fontWeight: Number(at.fontWeight) >= BOLD_FROM ? "400" : "700" };
    case "italic":
      return { fontStyle: at.fontStyle === "italic" ? "normal" : "italic" };
    case "underline":
      return { textDecoration: at.textDecoration === "underline" ? "none" : "underline" };
    case "strikethrough":
      return { textDecoration: at.textDecoration === "strikethrough" ? "none" : "strikethrough" };
  }
}
