import { mod } from "@canvas";

import type { Hsv } from "./color.types";
import { hexToRgb, rgbToHex } from "./hex";

/** `#RRGGBB` in HSV. */
export function hexToHsvColor(hex: string): Hsv {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: mod(h * 60, 360), s: max ? d / max : 0, v: max };
}

/** An HSV color as `#RRGGBB`. */
export function hsvToHexColor({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex([f(5), f(3), f(1)]);
}
