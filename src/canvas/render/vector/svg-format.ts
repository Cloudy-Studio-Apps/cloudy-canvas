import { Color, type ColorSource, type Matrix } from "pixi.js";

/** Rounds to what a drawing can show, so files don't fill up with float noise. */
export function num(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/** Text as it may sit in an attribute or between tags. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A `transform` value, or `null` for the identity. */
export function matrixValue({ a, b, c, d, tx, ty }: Matrix): string | null {
  if (a === 1 && b === 0 && c === 0 && d === 1 && tx === 0 && ty === 0) return null;
  return `matrix(${[a, b, c, d, tx, ty].map(num).join(" ")})`;
}

/** A color as `#rrggbb`, with its opacity. */
export function colorOf(color: ColorSource): { hex: string; alpha: number } {
  const parsed = Color.shared.setValue(color);
  return { hex: parsed.toHex(), alpha: parsed.alpha };
}

/** A `0xRRGGBB` number as `#rrggbb`. */
export function hexOf(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}
