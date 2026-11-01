/**
 * Encodes pixels as a WebP file, for webviews whose canvas can't (they hand back PNG). `quality` is
 * 0–1. Implemented in `platform/`.
 */
export type WebpEncoder = (image: ImageData, quality: number) => Promise<Uint8Array>;
