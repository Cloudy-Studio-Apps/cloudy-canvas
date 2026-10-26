import type { ContrastGrade } from "./contrast.types";

function channels(color: string): [number, number, number, number] {
  const n = parseInt(color.slice(1, 7), 16);
  const alpha = color.length >= 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
  return [n >> 16, (n >> 8) & 255, n & 255, alpha];
}

/** A color's relative luminance (WCAG), from `#RRGGBB(AA)` (its alpha ignored). */
export function luminance(color: string): number {
  const [r, g, b] = channels(color)
    .slice(0, 3)
    .map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** `top` laid over `bottom` (taken as opaque), as an opaque `#RRGGBB`. */
export function composite(top: string, bottom: string): string {
  const [r, g, b, a] = channels(top);
  const [r2, g2, b2] = channels(bottom);
  const mix = (x: number, y: number) =>
    Math.round(a * x + (1 - a) * y)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r, r2)}${mix(g, g2)}${mix(b, b2)}`.toUpperCase();
}

/** The WCAG contrast ratio of text on a surface (1–21); translucent text is laid on it first. */
export function contrastRatio(text: string, surface: string): number {
  const ground = composite(surface, "#FFFFFF");
  const [x, y] = [luminance(composite(text, ground)), luminance(ground)].sort((m, n) => n - m);
  return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05);
}

/** The WCAG 2 grade text gets at this contrast. */
export function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}

/** Grades from worst to best, to compare them. */
export const GRADE_ORDER: readonly ContrastGrade[] = ["fail", "AA large", "AA", "AAA"];
