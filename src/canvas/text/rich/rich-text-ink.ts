import type { Rect } from "../../geometry.types";
import type { RichTextLayout } from "./rich-text.types";

/** How far glyphs may reach past their line box, as a share of the largest font size. */
const OVERHANG = 0.5;

/**
 * The area a laid-out text draws in, in its box's coordinates: its lines, grown for glyphs that
 * reach past them (italics, accents, tight line heights). Empty when it has no lines.
 */
export function richTextInk(layout: RichTextLayout): Rect {
  const { lines, spans } = layout;
  if (lines.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  const pad = Math.max(0, ...spans.map((span) => span.font.size)) * OVERHANG;
  let left = Infinity;
  let right = -Infinity;
  for (const line of lines) {
    const first = line.fragments[0];
    const last = line.fragments[line.fragments.length - 1];
    left = Math.min(left, first ? first.x : line.x);
    right = Math.max(right, last ? last.x + last.w : line.x);
  }
  const top = lines[0]!.top;
  const bottom = lines[lines.length - 1]!.top + lines[lines.length - 1]!.height;
  return { x: left - pad, y: top - pad, w: right - left + pad * 2, h: bottom - top + pad * 2 };
}
