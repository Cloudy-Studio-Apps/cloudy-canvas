import { hexToOklch, mod, oklchToHex } from "@canvas";

/** A color in OKLab: [L, a, b]. */
function oklab(hex: string): [number, number, number] {
  const { L, C, H } = hexToOklch(hex);
  return [L, C * Math.cos(H), C * Math.sin(H)];
}

/** How different two colors look (OKLab distance): ~0.02 barely, 0.1 clearly. */
export function colorDistance(a: string, b: string): number {
  const [x, y] = [oklab(a), oklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/** The color halfway between two, mixed in OKLab so it looks halfway. */
export function midColor(a: string, b: string): string {
  const [x, y] = [oklab(a), oklab(b)];
  const [L, A, B] = x.map((v, i) => (v + (y[i] ?? 0)) / 2) as [number, number, number];
  return oklchToHex({ L, C: Math.hypot(A, B), H: Math.atan2(B, A) }).slice(0, 7);
}

/** The shortest turn from one hue to another, in degrees (−180–180). */
export function hueTurn(from: number, to: number): number {
  return mod(to - from + 180, 360) - 180;
}

/** An OKLCH color with the hue in degrees, as `#RRGGBB` (fitted into the screen's gamut). */
export function oklchColor(L: number, C: number, hueDegrees: number): string {
  return oklchToHex({ L, C, H: (hueDegrees * Math.PI) / 180 }).slice(0, 7);
}

/** A color's OKLCH, the hue in degrees. */
export function colorOklch(hex: string): { L: number; C: number; h: number } {
  const { L, C, H } = hexToOklch(hex);
  return { L, C, h: mod((H * 180) / Math.PI, 360) };
}
