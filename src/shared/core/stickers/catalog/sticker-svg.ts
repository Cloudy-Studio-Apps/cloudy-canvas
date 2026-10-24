import { STICKER_ART } from "./sticker-art";
import type { StickerLook } from "./sticker-catalog.types";

/** Built-in sticker art is drawn on this grid. */
export const STICKER_GRID = 128;

/**
 * Wraps artwork drawn on the 128-unit grid as a sticker: a die-cut edge (white, or
 * `look.edgeColor`) that follows its outline, with a soft shadow. Keep the art about 10 units
 * inside the grid so the edge fits.
 */
export function stickerSvg(art: string, defs = "", look?: StickerLook): string {
  const { edge, shadow, white } = STICKER_ART;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${STICKER_GRID} ${STICKER_GRID}" ` +
    `width="${STICKER_GRID * 4}" height="${STICKER_GRID * 4}">` +
    `<defs>${defs}<filter id="cut" x="-10%" y="-10%" width="120%" height="120%">` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="${edge}" result="grown"/>` +
    `<feFlood flood-color="${look?.edgeColor ?? white}"/><feComposite in2="grown" operator="in" result="edge"/>` +
    `<feDropShadow in="edge" dx="0" dy="1.5" stdDeviation="1.5" flood-color="${shadow}" flood-opacity="0.28" result="sticker"/>` +
    `<feMerge><feMergeNode in="sticker"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` +
    `<g filter="url(#cut)" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`
  );
}

/** SVG markup as a URL an `<img>` or `fetch` can load. */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
