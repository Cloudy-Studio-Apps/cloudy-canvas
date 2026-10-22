const MAX_TEXT_RESOLUTION = 4;
/** Longest side, in pixels, of one text's texture: larger texts get a lower resolution. */
const MAX_TEXT_TEXTURE_PX = 4096;
/** Lowest resolution a capped text gets, so a huge one stays legible from afar. */
const MIN_TEXT_RESOLUTION = 0.25;

/** Text resolution that keeps world-space text crisp at `zoom`. */
export function textResolution(zoom: number): number {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr * Math.max(1, Math.ceil(zoom * 2) / 2), MAX_TEXT_RESOLUTION);
}

/**
 * `resolution` for a text in an element whose longest side is `side` world units, lowered so its
 * texture stays within `MAX_TEXT_TEXTURE_PX` (a page-sized text zoomed in would take hundreds of
 * megabytes otherwise).
 */
export function cappedTextResolution(resolution: number, side: number): number {
  const cap = Math.max(MAX_TEXT_TEXTURE_PX / Math.max(side, 1), MIN_TEXT_RESOLUTION);
  return Math.min(resolution, cap);
}
