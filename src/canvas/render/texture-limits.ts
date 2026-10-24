import type { Renderer as PixiRenderer } from "pixi.js";

/**
 * The longest side of a picture's texture in an export: 8192 px is 256 MB a picture, and more than
 * a print page needs (an A3 page at 300 dpi is about 5000 px).
 */
const EXPORT_MAX_TEXTURE_PX = 8192;

/** What the canvas renderer (no WebGL) is assumed to draw. */
const FALLBACK_MAX_TEXTURE_PX = 4096;

const limits = new WeakMap<PixiRenderer, number>();

/** The longest texture side exports use: the GPU's limit, at most `EXPORT_MAX_TEXTURE_PX`. */
export function maxTexturePixels(renderer: PixiRenderer): number {
  let limit = limits.get(renderer);
  if (limit === undefined) {
    const gl = (renderer as { gl?: WebGLRenderingContext }).gl;
    const own = gl ? (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) : FALLBACK_MAX_TEXTURE_PX;
    limit = Math.min(own || FALLBACK_MAX_TEXTURE_PX, EXPORT_MAX_TEXTURE_PX);
    limits.set(renderer, limit);
  }
  return limit;
}
