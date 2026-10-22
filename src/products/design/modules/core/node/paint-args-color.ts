const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** A `#rgb` or `#rrggbb` color as `#RRGGBB`; throws naming `key` otherwise. */
export function hexColor(value: unknown, key: string): string {
  if (typeof value !== "string" || !HEX.test(value)) {
    throw new Error(`"${key}" must be a hex color like #1E88E5, got ${JSON.stringify(value)}.`);
  }
  const hex = value.length === 4 ? value.replace(/[0-9a-f]/gi, (c) => c + c) : value;
  return hex.toUpperCase();
}
