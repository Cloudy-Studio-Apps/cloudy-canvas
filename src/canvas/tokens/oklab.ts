import type { Oklch } from "./oklab.types";

const toLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const toByte = (c: number): number => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
};

/** `#RRGGBB(AA)` in OKLCH (the alpha is ignored). */
export function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = toLinear(n >> 16);
  const g = toLinear((n >> 8) & 255);
  const b = toLinear(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) };
}

function toLinearRgb({ L, C, H }: Oklch): [number, number, number] {
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** An OKLCH color as `#RRGGBBFF`, its chroma lowered until it fits the screen's gamut. */
export function oklchToHex(color: Oklch): string {
  let C = color.C;
  const outside = (c: number) =>
    toLinearRgb({ ...color, C: c }).some((x) => x < -0.0005 || x > 1.0005);
  for (let i = 0; i < 40 && outside(C); i++) C *= 0.92;
  const hex = toLinearRgb({ ...color, C })
    .map(toByte)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}FF`;
}
