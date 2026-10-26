import { normalizeColorHex, rgbToHex } from "./hex";
import { oklchColor } from "./perceptual";

function hslToRgb(h: number, s: number, l: number): number[] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return [f(0), f(8), f(4)];
}

/** The numbers in a CSS function, percentages as fractions. */
function numbers(text: string): number[] {
  return (text.match(/-?[\d.]+%?/g) ?? []).map((n) =>
    n.endsWith("%") ? parseFloat(n) / 100 : parseFloat(n),
  );
}

/** A CSS color (hex, `rgb()`, `hsl()` or `oklch()`) as `#RRGGBB`, or `null`. */
export function parseCssColor(text: string): string | null {
  const s = text.trim();
  if (s.startsWith("#")) return normalizeColorHex(s);
  if (/^[0-9a-f]{6}$/i.test(s)) return normalizeColorHex(s);
  const n = numbers(s);
  if (n.length < 3) return null;
  const [a, b, c] = n as [number, number, number];
  if (/^rgba?\(/i.test(s)) {
    // Percentages came in as fractions.
    const percent = s.includes("%");
    return rgbToHex([a, b, c].map((v) => (percent ? v * 255 : v)));
  }
  if (/^hsla?\(/i.test(s)) return rgbToHex(hslToRgb(a, b, c));
  if (/^oklch\(/i.test(s)) return oklchColor(a > 1 ? a / 100 : a, b, c);
  return null;
}
