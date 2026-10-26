const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** A `#rgb` or `#rrggbb` color as `#RRGGBB`; throws naming `key` otherwise. */
export function hexColor(value: unknown, key: string): string {
  if (typeof value !== "string" || !HEX.test(value)) {
    throw new Error(`"${key}" must be a hex color like #1E88E5, got ${JSON.stringify(value)}.`);
  }
  const hex = value.length === 4 ? value.replace(/[0-9a-f]/gi, (c) => c + c) : value;
  return hex.toUpperCase();
}

const HEX_ALPHA = /^#[0-9a-f]{8}$/i;

/**
 * A paint's color: `#rgb`/`#rrggbb` (opaque), or `#rrggbbaa` whose alpha becomes the paint's
 * opacity (as a bound color variable's does); throws naming `key` otherwise.
 */
export function hexColorAlpha(value: unknown, key: string): { color: string; alpha: number } {
  if (typeof value === "string" && HEX_ALPHA.test(value)) {
    const alpha = Math.round((parseInt(value.slice(7, 9), 16) / 255) * 1000) / 1000;
    return { color: value.slice(0, 7).toUpperCase(), alpha };
  }
  try {
    return { color: hexColor(value, key), alpha: 1 };
  } catch {
    throw new Error(
      `"${key}" must be a hex color like #1E88E5 (or #1E88E580 with alpha), got ${JSON.stringify(value)}.`,
    );
  }
}
