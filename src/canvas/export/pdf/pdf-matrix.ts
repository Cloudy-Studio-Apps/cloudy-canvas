import type { Point } from "../../geometry.types";
import type { PdfMatrix } from "./pdf-writer.types";

export const IDENTITY: PdfMatrix = [1, 0, 0, 1, 0, 0];

/** `m` after `n`: a point goes through `n`, then `m`. */
export function multiply(m: PdfMatrix, n: PdfMatrix): PdfMatrix {
  const [a, b, c, d, e, f] = m;
  const [g, h, i, j, k, l] = n;
  return [
    a * g + c * h,
    b * g + d * h,
    a * i + c * j,
    b * i + d * j,
    a * k + c * l + e,
    b * k + d * l + f,
  ];
}

export function apply([a, b, c, d, e, f]: PdfMatrix, { x, y }: Point): Point {
  return { x: a * x + c * y + e, y: b * x + d * y + f };
}

export function invert([a, b, c, d, e, f]: PdfMatrix): PdfMatrix {
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-12) return IDENTITY;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

/** The `transform` values the SVG writer makes: `matrix(…)` and `translate(…)`. */
export function parseTransform(value: string | null): PdfMatrix {
  let result = IDENTITY;
  for (const [, name, args] of (value ?? "").matchAll(/(matrix|translate)\(([^)]*)\)/g)) {
    const n = (args ?? "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const step: PdfMatrix =
      name === "matrix"
        ? [n[0] ?? 1, n[1] ?? 0, n[2] ?? 0, n[3] ?? 1, n[4] ?? 0, n[5] ?? 0]
        : [1, 0, 0, 1, n[0] ?? 0, n[1] ?? 0];
    result = multiply(result, step);
  }
  return result;
}

export function matrixOps(m: PdfMatrix): string {
  return m.map(pdfNumber).join(" ");
}

export function pdfNumber(value: number): string {
  return String(Math.round(value * 10000) / 10000);
}
