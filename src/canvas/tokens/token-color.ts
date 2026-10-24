import { clamp } from "../utils";

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` (the `#` optional) as `#RRGGBBAA`, else `null`. */
export function parseTokenColor(text: string): string | null {
  const match = HEX.exec(text.trim());
  const digits = match?.[1];
  if (!digits) return null;
  const full = digits.length <= 4 ? [...digits].map((d) => d + d).join("") : digits;
  return `#${(full.length === 6 ? `${full}ff` : full).toUpperCase()}`;
}

/** A token color's `#RRGGBB` and its alpha (0–1). */
export function splitTokenColor(color: string): { hex: string; alpha: number } {
  const parsed = parseTokenColor(color) ?? "#000000FF";
  const alpha = parseInt(parsed.slice(7, 9), 16) / 255;
  return { hex: parsed.slice(0, 7), alpha: Math.round(alpha * 1000) / 1000 };
}

/** `#RRGGBB` and an alpha (0–1) as a token color. */
export function joinTokenColor(hex: string, alpha: number): string {
  const rgb = (parseTokenColor(hex) ?? "#000000FF").slice(0, 7);
  const a = Math.round(clamp(alpha, 0, 1) * 255);
  return `${rgb}${a.toString(16).padStart(2, "0").toUpperCase()}`;
}
