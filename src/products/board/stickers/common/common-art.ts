import { ThumbsDown, ThumbsUp, type IconNode } from "lucide";

import { STICKER_ART } from "../sticker-art";
import { heartPath } from "../sticker-shapes";

const { ink, white, red, yellow, orange, green, blue, violet } = STICKER_ART;

/** A Lucide icon filled with `color`, scaled from its 24-unit grid to fill the sticker. */
function filledIcon(node: IconNode, color: string): string {
  const [first, ...rest] = node;
  const shape = (attrs: Record<string, unknown>, fill: string) =>
    `<path d="${String(attrs.d)}" fill="${fill}" stroke="${ink}" stroke-width="1.3"/>`;
  return (
    `<g transform="translate(16 16) scale(4)">` +
    (first ? shape(first[1], color) : "") +
    rest.map(([, attrs]) => shape(attrs, "none")).join("") +
    `</g>`
  );
}

/** A round badge with white content on top. */
function badge(color: string, content: string): string {
  return `<circle cx="64" cy="64" r="50" fill="${color}" stroke="${ink}" stroke-width="3.5"/>${content}`;
}

const glyph = (d: string, width = 12) =>
  `<path d="${d}" fill="none" stroke="${white}" stroke-width="${width}"/>`;

/** The common stamps' artwork, on the 128-unit sticker grid. */
export const COMMON_ART = {
  heart:
    `<path d="${heartPath(64, 62, 52)}" fill="${red}" stroke="${ink}" stroke-width="3.5"/>` +
    `<path d="M36 44q6-10 16-8" fill="none" stroke="${white}" stroke-width="6" opacity="0.6"/>`,
  thumbsUp: filledIcon(ThumbsUp, green),
  thumbsDown: filledIcon(ThumbsDown, blue),
  plusOne: badge(violet, glyph("M30 64h28M44 50v28") + glyph("M74 46l12-8v54")),
  star:
    `<path d="M64 12l15.3 32.1 35.2 4.5-25.8 24.4 6.6 34.9L64 91 32.7 107.9l6.6-34.9L13.5 48.6l35.2-4.5z" fill="${yellow}" stroke="${ink}" stroke-width="3.5"/>` +
    `<path d="M52 50l6-12" fill="none" stroke="${white}" stroke-width="5" opacity="0.7"/>`,
  question: badge(
    orange,
    glyph("M50 50a14 14 0 1 1 20 12.5c-4 2-6 4.5-6 9.5v2") +
      `<circle cx="64" cy="90" r="7" fill="${white}"/>`,
  ),
  check: badge(green, glyph("M40 65l16 16 32-34", 13)),
  fire:
    `<path d="M64 10c6 22 36 34 36 70a36 36 0 0 1-72 0c0-20 12-30 16-46 6 10 8 16 10 20 2-16 4-30 10-44z" fill="${orange}" stroke="${ink}" stroke-width="3.5"/>` +
    `<path d="M64 62c4 12 18 18 18 32a18 18 0 0 1-36 0c0-10 6-16 8-24 4 6 6 8 6 8 1-6 2-10 4-16z" fill="${yellow}"/>`,
} as const;
