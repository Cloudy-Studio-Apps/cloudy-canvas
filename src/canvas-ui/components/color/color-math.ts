import { normalizeHex } from "../normalize-hex";
import type { Hsv } from "./color.types";

/** `#rrggbb` (or any hex `normalizeHex` reads) as HSV; black for anything else. */
export function hexToHsv(hex: string): Hsv {
  const value = normalizeHex(hex) ?? "#000000";
  const r = parseInt(value.slice(1, 3), 16) / 255;
  const g = parseInt(value.slice(3, 5), 16) / 255;
  const b = parseInt(value.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : delta / max, v: max };
}

/** HSV as lowercase `#rrggbb`. */
export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}

/** The pure color of a hue, for the color area's background. */
export function hueColor(h: number): string {
  return hsvToHex({ h, s: 1, v: 1 });
}
