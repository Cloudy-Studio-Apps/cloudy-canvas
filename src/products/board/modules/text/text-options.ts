import { clamp, type ElementPatch } from "@canvas";

import type { BoardToolOptions } from "../../board-options.types";
import { colorTokenOptions, restyleColors } from "../../tokens";
import { TEXT_BOLD_WEIGHT, TEXT_DEFAULTS } from "./text.defaults";
import { fitLabel } from "./text-measure";
import type { TextElement, TextLook, TextToolOptions } from "./text.types";

/** Whether a weight reads as bold (600 and up). */
export function isBold(look: TextLook): boolean {
  return Number(look.fontWeight ?? "400") >= 600;
}

/** A font size the panel and Paste properties may set. */
export function clampFontSize(fontSize: number): number {
  return clamp(Math.round(fontSize), TEXT_DEFAULTS.minFontSize, TEXT_DEFAULTS.maxFontSize);
}

/** The look new text takes from the tool options. */
export function textLookOf(options: TextToolOptions): TextLook {
  return {
    fontWeight: options.textBold ? TEXT_BOLD_WEIGHT : "400",
    fontStyle: options.textItalic ? "italic" : "normal",
    align: options.textAlign,
  };
}

/** The options a selected label shows in the panel. */
export function textOptionsOf(el: TextElement): Partial<BoardToolOptions> {
  return {
    textColor: el.color,
    textSize: el.fontSize,
    textBold: isBold(el),
    textItalic: el.fontStyle === "italic",
    textAlign: el.align ?? "left",
    textAutoWidth: !el.wrap,
    ...colorTokenOptions(el, TEXT_DEFAULTS.colorOptions),
  };
}

/** How options picked in the panel restyle a label; it's sized to its text again. */
export function restyleText(
  el: TextElement,
  options: Partial<BoardToolOptions>,
): ElementPatch<TextElement> {
  const patch = restyleColors(el, options, TEXT_DEFAULTS.colorOptions) as ElementPatch<TextElement>;
  if (options.textSize !== undefined) patch.fontSize = clampFontSize(options.textSize);
  if (options.textBold !== undefined) {
    patch.fontWeight = options.textBold ? TEXT_BOLD_WEIGHT : "400";
  }
  if (options.textItalic !== undefined) patch.fontStyle = options.textItalic ? "italic" : "normal";
  if (options.textAlign !== undefined) patch.align = options.textAlign;
  if (options.textAutoWidth !== undefined) patch.wrap = !options.textAutoWidth;
  const next = { ...el, ...patch };
  const refits = (["fontSize", "fontWeight", "fontStyle", "wrap"] as const).some(
    (field) => next[field] !== el[field],
  );
  return refits ? { ...patch, ...fitLabel(next) } : patch;
}
