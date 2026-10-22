import type { Rgba } from "./gradient-color.types";

/** A `#rgb` or `#rrggbb` color (alpha `opacity`) as channels; anything else reads as black. */
export function hexToRgba(hex: string, opacity = 1): Rgba {
  let digits = hex.replace(/^#/, "");
  if (digits.length === 3) digits = digits.replace(/./g, (c) => c + c);
  const value = /^[0-9a-f]{6}$/i.test(digits) ? parseInt(digits, 16) : 0;
  return {
    r: ((value >> 16) & 0xff) / 255,
    g: ((value >> 8) & 0xff) / 255,
    b: (value & 0xff) / 255,
    a: opacity,
  };
}

/** The color's `#RRGGBB` (alpha left out). */
export function rgbaToHex({ r, g, b }: Rgba): string {
  const byte = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`.toUpperCase();
}

function toLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function toGamma(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055;
}

/** sRGB channels as OKLab `[L, a, b]`. */
export function srgbToOklab({ r, g, b }: Rgba): [number, number, number] {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab `[L, a, b]` as sRGB channels (alpha `a`), clipped into the sRGB gamut. */
export function oklabToSrgb([L, A, B]: readonly [number, number, number], alpha: number): Rgba {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const clip = (v: number) => Math.min(1, Math.max(0, toGamma(v)));
  return {
    r: clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: alpha,
  };
}
