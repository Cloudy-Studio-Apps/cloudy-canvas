import { cssFont } from "../text-font";
import { spanOffsets } from "./measure-span";
import type { Rect } from "../../geometry.types";
import type { RichFragment, RichLine, RichTextLayout } from "./rich-text.types";

/** Where an underline and a strikethrough sit below and above the baseline, and how thick. */
const UNDERLINE_OFFSET = 0.1;
const STRIKE_OFFSET = 0.28;
const LINE_THICKNESS = 1 / 14;

/**
 * Draws a laid-out text into a 2D context whose origin is the text box's corner (the caller
 * scales it for resolution): each span's fragments on their baselines in its color and opacity
 * (`white`: everything opaque white, for a mask), and their underlines and strikethroughs.
 * Letter-spaced text is drawn a character at a time, at the boundaries the layout measured.
 */
export function drawRichText(
  ctx: CanvasRenderingContext2D,
  layout: RichTextLayout,
  white = false,
): void {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  for (const line of layout.lines) {
    for (const fragment of line.fragments) {
      const span = layout.spans[fragment.span];
      if (!span || (!white && span.color === null)) continue;
      ctx.fillStyle = white ? "#ffffff" : (span.color ?? "#000000");
      ctx.globalAlpha = white ? 1 : span.alpha;
      ctx.font = cssFont(span.font);
      const text = layout.text.slice(fragment.start, fragment.end);
      if (!fragment.space) {
        if (span.font.letterSpacing === 0) ctx.fillText(text, fragment.x, line.baseline);
        else drawSpaced(ctx, text, fragment.x, line.baseline, spanOffsets(text, span.font));
      }
      const decoration = decorationRect(layout, line, fragment);
      if (decoration) ctx.fillRect(decoration.x, decoration.y, decoration.w, decoration.h);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * The underline or strikethrough of a fragment (`null` without one, or for the spaces a line ends
 * with), in the text box's coordinates: what drawing and glyph outlines both add.
 */
export function decorationRect(
  layout: RichTextLayout,
  line: RichLine,
  fragment: RichFragment,
): Rect | null {
  const span = layout.spans[fragment.span];
  if (!span || span.decoration === "none") return null;
  if (fragment.space && fragment.end >= line.end) return null;
  const size = span.font.size;
  const thickness = Math.max(1, size * LINE_THICKNESS);
  const y =
    span.decoration === "underline"
      ? line.baseline + size * UNDERLINE_OFFSET
      : line.baseline - size * STRIKE_OFFSET;
  return { x: fragment.x, y: y - thickness / 2, w: fragment.w, h: thickness };
}

function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  offsets: readonly number[],
): void {
  let i = 0;
  for (const char of text) {
    ctx.fillText(char, x + (offsets[i] ?? 0), baseline);
    i += char.length;
  }
}
