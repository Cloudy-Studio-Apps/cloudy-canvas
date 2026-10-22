import { ELEMENT_DEFAULTS } from "../elements/element.defaults";
import { cssFont, textFont } from "./text-font";
import type { TextFont } from "./text-font.types";

let context: CanvasRenderingContext2D | null = null;

function getContext(): CanvasRenderingContext2D | null {
  context ??= document.createElement("canvas").getContext("2d");
  return context;
}

export function fontString(fontSize: number, weight = 400): string {
  return `${weight} ${fontSize}px ${ELEMENT_DEFAULTS.fontFamily}`;
}

/** Measures one line in `font` (letter spacing included). */
function lineWidth(font: TextFont): (line: string) => number {
  const ctx = getContext();
  if (ctx) ctx.font = cssFont(font);
  return (line) => {
    const base = ctx ? ctx.measureText(line).width : line.length * font.size * 0.55;
    return base + font.letterSpacing * [...line].length;
  };
}

/**
 * The lines of `text` in `font`, wrapped greedily at `maxWidth` (unwrapped without one), and the
 * size of the block. Everything that lays text out (drawers, the editor, auto-sizing) uses this.
 */
export function measureTextBlock(
  text: string,
  font: TextFont,
  maxWidth?: number,
): { lines: string[]; w: number; h: number } {
  const width = lineWidth(font);
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (maxWidth === undefined) {
      lines.push(paragraph);
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && width(next) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return {
    lines,
    w: Math.ceil(Math.max(0, ...lines.map(width))) + 2,
    h: Math.ceil(lines.length * font.size * font.lineHeight),
  };
}

/** Size of unwrapped multi-line text in the app's font. */
export function measureText(text: string, fontSize: number): { w: number; h: number } {
  const { w, h } = measureTextBlock(text, textFont(fontSize));
  return { w, h };
}

/** Greedy word-wrap of `text` to `maxWidth` in the app's font, with the resulting lines and size. */
export function measureWrapped(
  text: string,
  fontSize: number,
  maxWidth: number,
  weight = 400,
): { lines: string[]; w: number; h: number } {
  const font = textFont(fontSize, { fontWeight: String(weight) as TextFont["weight"] });
  return measureTextBlock(text, font, maxWidth);
}

/** Top offset that vertically centers one line of text in a box of `height`. */
export function centerTextTop(height: number, fontSize: number): number {
  return (height - fontSize * ELEMENT_DEFAULTS.lineHeight) / 2;
}
