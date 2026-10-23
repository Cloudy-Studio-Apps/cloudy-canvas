import { cssFont } from "../text-font";
import type { TextFont } from "../text-font.types";

let context: CanvasRenderingContext2D | null = null;

function contextFor(font: TextFont): CanvasRenderingContext2D | null {
  context ??= document.createElement("canvas").getContext("2d");
  if (context) {
    context.font = cssFont(font);
    if ("letterSpacing" in context) context.letterSpacing = "0px";
  }
  return context;
}

/** The width of `text` in `font`, its letter spacing after every character. */
export function measureSpan(text: string, font: TextFont): number {
  if (text.length === 0) return 0;
  const ctx = contextFor(font);
  const base = ctx ? ctx.measureText(text).width : text.length * font.size * 0.55;
  return base + font.letterSpacing * [...text].length;
}

/**
 * Where each character boundary of `text` falls from its start (`text.length + 1` values, by
 * UTF-16 index; the middle of a surrogate pair takes the boundary before it). Measured by
 * prefixes, so kerning is kept, as drawing does.
 */
export function spanOffsets(text: string, font: TextFont): number[] {
  const offsets = [0];
  let chars = 0;
  for (let i = 1; i <= text.length; i++) {
    const code = text.charCodeAt(i - 1);
    // A high surrogate's boundary is inside its character.
    if (code >= 0xd800 && code <= 0xdbff && i < text.length) {
      offsets.push(offsets[i - 1]!);
      continue;
    }
    chars++;
    const ctx = contextFor(font);
    const base = ctx ? ctx.measureText(text.slice(0, i)).width : chars * font.size * 0.55;
    offsets.push(base + font.letterSpacing * chars);
  }
  return offsets;
}
