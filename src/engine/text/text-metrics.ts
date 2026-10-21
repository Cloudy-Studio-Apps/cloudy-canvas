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
