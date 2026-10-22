import { hexToRgba, rgbaToHex } from "./gradient-color";
import type { Rgba } from "./gradient-color.types";

/** The few color names CSS gradients are usually written with. */
const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  green: "#008000",
  lime: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  gray: "#808080",
  grey: "#808080",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
};

/** A color as CSS: `#RRGGBB` when opaque, `rgba(…)` otherwise. */
export function cssColor(color: Rgba): string {
  if (color.a >= 0.999) return rgbaToHex(color);
  const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
  const alpha = Math.round(Math.max(0, color.a) * 100) / 100;
  return `rgba(${byte(color.r)}, ${byte(color.g)}, ${byte(color.b)}, ${alpha})`;
}

/**
 * A CSS color: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`/`rgba()` (commas or spaces, alpha
 * after `/` or a fourth value, numbers or percentages), `transparent` or a common name. `null`
 * when it isn't one.
 */
export function parseCssColor(text: string): Rgba | null {
  const value = text.trim().toLowerCase();
  if (value === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const named = NAMED[value];
  if (named) return hexToRgba(named);
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value)?.[1];
  if (hex) {
    const full = hex.length <= 4 ? hex.replace(/./g, (c) => c + c) : hex;
    const alpha = full.length === 8 ? parseInt(full.slice(6), 16) / 255 : 1;
    return hexToRgba(`#${full.slice(0, 6)}`, alpha);
  }
  const fn = /^rgba?\((.*)\)$/.exec(value)?.[1];
  if (fn === undefined) return null;
  const parts = fn.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const channel = (part: string, max: number) =>
    part.endsWith("%") ? parseFloat(part) / 100 : parseFloat(part) / max;
  const [r, g, b] = parts.slice(0, 3).map((part) => channel(part, 255)) as [number, number, number];
  const a = parts[3] === undefined ? 1 : channel(parts[3], 1);
  if ([r, g, b, a].some((v) => !Number.isFinite(v))) return null;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return { r: clamp(r), g: clamp(g), b: clamp(b), a: clamp(a) };
}
