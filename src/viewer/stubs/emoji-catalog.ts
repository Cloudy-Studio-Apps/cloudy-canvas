import type { StickerSection } from "@shared/core";

/**
 * Stands in for the emoji sticker catalog in the viewer build (`vite.viewer.config.ts`): the
 * viewer draws stickers from the board's own assets and never offers the catalog, which would add
 * about a megabyte to every exported file.
 */
export const EMOJI_SECTIONS: readonly StickerSection[] = [];
