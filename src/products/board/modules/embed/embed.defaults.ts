import type { EmbedDefaults } from "./embed.types";

export const EMBED_DEFAULTS = {
  width: 360,
  minWidth: 240,
  padding: 8,
  footerHeight: 64,
  previewRatio: 9 / 16,
  radius: 6,
  titleSize: 14,
  siteSize: 12,
  playRadius: 24,
  buttonSize: 28,
} as const satisfies EmbedDefaults;
