import type { Size } from "../geometry.types";
import type { PlaceholderSvgOptions } from "./placeholder-svg.types";

import { placeholderInk } from "./placeholder-ink";

/** The art's own square, scaled to the picture. */
const ART = 128;
/** How much of the picture's short side the art covers (small enough for `fill` never to crop it). */
const ART_SHARE = 0.42;

/** The foca watona peeking up, with a "?" beside it, in a 128-unit square. */
function sealArt(ink: string): string {
  const soft = `fill="${ink}" fill-opacity="0.16"`;
  const line = (width: number) =>
    `fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  const spot = (cx: number, cy: number, rx: number, ry: number) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${ink}" fill-opacity="0.32"/>`;
  return (
    // Head and body.
    `<path d="M14 118q-4-62 42-66q46 4 42 66z" ${soft} stroke="${ink}" stroke-width="4" stroke-linejoin="round"/>` +
    spot(36, 72, 4, 2.6) +
    spot(48, 64, 3, 2) +
    spot(74, 68, 4.4, 2.8) +
    spot(84, 82, 3, 2.2) +
    // Eyes, muzzle and whiskers.
    `<ellipse cx="42" cy="84" rx="4.2" ry="5.2" fill="${ink}"/>` +
    `<ellipse cx="70" cy="84" rx="4.2" ry="5.2" fill="${ink}"/>` +
    `<ellipse cx="56" cy="96" rx="9" ry="6" ${soft} stroke="${ink}" stroke-width="3"/>` +
    `<ellipse cx="56" cy="93" rx="3.2" ry="2.2" fill="${ink}"/>` +
    `<path d="M44 96h-14M44 101l-12 4M68 96h14M68 101l12 4" ${line(2.5)}/>` +
    // The question mark.
    `<path d="M98 22q0-12 12-12t12 12q0 8-12 12v10" ${line(6)}/>` +
    `<circle cx="110" cy="56" r="4" fill="${ink}"/>`
  );
}

/**
 * A placeholder picture: `background` at `size`'s proportions with the foca watona and a "?" in
 * its middle, as an SVG file; `options.label` is written under the art (e.g. a plugin's name).
 */
export function placeholderSvg(
  background: string,
  size: Size,
  options: PlaceholderSvgOptions = {},
): string {
  const { w, h } = size;
  const scale = (Math.min(w, h) * ART_SHARE) / ART;
  const x = (w - ART * scale) / 2;
  const y = (h - ART * scale) / 2;
  const ink = placeholderInk(background);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="${w}" height="${h}" fill="${background}"/>` +
    `<g transform="translate(${x} ${y}) scale(${scale})">${sealArt(ink)}</g>` +
    (options.label ? labelText(options.label, ink, size, y + ART * scale) : "") +
    `</svg>`
  );
}

/** One centered line under the art, squeezed to fit when it's wider than the picture. */
function labelText(label: string, ink: string, { w, h }: Size, artBottom: number): string {
  const fontSize = Math.min(w, h) * 0.08;
  const baseline = Math.min(h - fontSize * 0.4, artBottom + fontSize * 1.4);
  // A rough width (0.55 em a letter) decides whether it has to be squeezed.
  const fit =
    label.length * fontSize * 0.55 > w * 0.9
      ? ` textLength="${w * 0.9}" lengthAdjust="spacingAndGlyphs"`
      : "";
  return (
    `<text x="${w / 2}" y="${baseline}" text-anchor="middle" fill="${ink}" ` +
    `font-family="Inter, sans-serif" font-size="${fontSize}"${fit}>${escapeXml(label)}</text>`
  );
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
