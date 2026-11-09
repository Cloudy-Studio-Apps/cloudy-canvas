const BLACK = "#000000";
const WHITE = "#ffffff";

/** A channel's linear value (WCAG relative luminance). */
function linear(channel: number): number {
  const v = channel / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/**
 * The text color that reads best on a user-picked `background` (`#rgb` or `#rrggbb`): black on a
 * light color, white on a dark one, whatever the theme. White for anything else.
 */
export function readableTextOn(background: string): string {
  const hex = background.trim().replace(/^#/, "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return WHITE;
  const n = parseInt(full, 16);
  const lum = 0.2126 * linear(n >> 16) + 0.7152 * linear((n >> 8) & 255) + 0.0722 * linear(n & 255);
  // Where black and white text have the same contrast on it (WCAG): ~0.179.
  return lum > 0.179 ? BLACK : WHITE;
}
