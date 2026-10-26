import { clamp } from "@canvas";

import type { CvdKind } from "./color.types";
import { hexToRgb, rgbToHex } from "./hex";

// Machado, Oliveira and Fernandes (2009) at full severity, applied in linear RGB; achromatopsia
// keeps only the luminance.
const MATRICES: Record<Exclude<CvdKind, "none">, readonly number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039,
  ],
  achromatopsia: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
};

/** The deficiencies a palette is checked against (achromatopsia is preview only). */
export const CHECKED_CVD: readonly CvdKind[] = ["protanopia", "deuteranopia", "tritanopia"];

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const toByte = (c: number) => {
  const v = clamp(c, 0, 1);
  return (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255;
};

/** How `hex` looks to someone with `kind` (itself for `none`). */
export function simulateCvd(hex: string, kind: CvdKind): string {
  if (kind === "none") return hex;
  const m = MATRICES[kind];
  const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
  const row = (i: number) =>
    (m[i * 3] ?? 0) * r + (m[i * 3 + 1] ?? 0) * g + (m[i * 3 + 2] ?? 0) * b;
  return rgbToHex([toByte(row(0)), toByte(row(1)), toByte(row(2))]);
}
