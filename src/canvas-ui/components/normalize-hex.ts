/** `#rgb`, `rgb`, `#rrggbb` or `rrggbb` as lowercase `#rrggbb`; `null` when it isn't a hex color. */
export function normalizeHex(value: string): string | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  const digits = match?.[1]?.toLowerCase();
  if (!digits) return null;
  if (digits.length === 6) return `#${digits}`;
  return `#${[...digits].map((d) => d + d).join("")}`;
}
