import { FONT_FAMILY, LINE_HEIGHT } from "../document/shape-defaults";

let context: CanvasRenderingContext2D | null = null;

function getContext(): CanvasRenderingContext2D | null {
  context ??= document.createElement("canvas").getContext("2d");
  return context;
}

export function fontString(fontSize: number, weight = 400): string {
  return `${weight} ${fontSize}px ${FONT_FAMILY}`;
}

/** Size of unwrapped multi-line text, in the same units as `fontSize`. */
export function measureText(text: string, fontSize: number): { w: number; h: number } {
  const lines = text.split("\n");
  const ctx = getContext();
  let width = 0;
  if (ctx) {
    ctx.font = fontString(fontSize);
    for (const line of lines) width = Math.max(width, ctx.measureText(line).width);
  } else {
    width = Math.max(...lines.map((line) => line.length)) * fontSize * 0.55;
  }
  return { w: Math.ceil(width) + 2, h: Math.ceil(lines.length * fontSize * LINE_HEIGHT) };
}

/** Greedy word-wrap of `text` to `maxWidth`, with the resulting lines and size. */
export function measureWrapped(
  text: string,
  fontSize: number,
  maxWidth: number,
): { lines: string[]; w: number; h: number } {
  const ctx = getContext();
  if (ctx) ctx.font = fontString(fontSize);
  const width = (s: string) => (ctx ? ctx.measureText(s).width : s.length * fontSize * 0.55);
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
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
  const w = Math.max(0, ...lines.map(width));
  return { lines, w: Math.ceil(w) + 2, h: Math.ceil(lines.length * fontSize * LINE_HEIGHT) };
}
