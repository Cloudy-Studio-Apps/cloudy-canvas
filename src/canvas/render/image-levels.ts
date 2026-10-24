/**
 * The sizes (pixels on the long side) the canvas keeps pictures at. Each step doubles, so a
 * picture is at most twice as sharp as it shows.
 */
export const IMAGE_LEVELS = [256, 512, 1024, 2048, 4096] as const;

/** The level every picture is loaded at first, and kept at: enough for most of a screen. */
export const BASE_LEVEL = 1024;

/** The sharpest level: larger pictures are scaled down to it on the canvas (exports read more). */
export const MAX_LEVEL = 4096;

/** A picture asked for this much more than a level still takes that level (not the next one). */
const LEVEL_TOLERANCE = 1.15;

/**
 * The level that shows `pixels` sharply: the smallest step at least that large (within the
 * tolerance), at most `own` (a raster's long side; `Infinity` for an SVG).
 */
export function levelFor(pixels: number, own: number): number {
  const wanted = pixels / LEVEL_TOLERANCE;
  const step = IMAGE_LEVELS.find((level) => level >= wanted) ?? MAX_LEVEL;
  return Math.max(1, Math.min(step, Math.round(own)));
}

/** GPU bytes of a texture this size with its mipmaps (a third more). */
export function textureBytes(w: number, h: number): number {
  return Math.round((w * h * 4 * 4) / 3);
}
