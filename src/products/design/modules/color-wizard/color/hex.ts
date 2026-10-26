import { clamp } from "@canvas";

/** `#RGB`, `#RRGGBB` or `#RRGGBBAA` (the `#` optional) as `#RRGGBB`, or `null`. */
export function normalizeColorHex(text: string): string | null {
  const m = text.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(m)) return `#${[...m].map((c) => c + c).join("")}`.toUpperCase();
  if (/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(m)) return `#${m.slice(0, 6)}`.toUpperCase();
  return null;
}

/** `#RRGGBB` as 0–255 channels. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** 0–255 channels (clamped and rounded) as `#RRGGBB`. */
export function rgbToHex(rgb: readonly number[]): string {
  const part = (c: number | undefined) =>
    clamp(Math.round(c ?? 0), 0, 255)
      .toString(16)
      .padStart(2, "0");
  return `#${rgb.slice(0, 3).map(part).join("")}`.toUpperCase();
}
