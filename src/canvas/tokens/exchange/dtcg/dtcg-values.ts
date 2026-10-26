import { joinTokenColor, parseTokenColor, splitTokenColor } from "../../token-color";
import type { TokenScope } from "../../token.types";

/** The extension key Cloudy Canvas writes and reads. */
export const DTCG_EXTENSION = "app.cloudy-canvas";

/** Scopes whose numbers are lengths, written as `dimension`s in px. */
export const PX_SCOPES: ReadonlySet<TokenScope> = new Set<TokenScope>([
  "width-height",
  "gap",
  "padding",
  "corner-radius",
  "stroke-weight",
  "font-size",
  "letter-spacing",
  "effect-value",
]);

/** Root font size `rem` and `em` are read against. */
const REM = 16;

/** A token color as DTCG's hex (`#rrggbb`, or `#rrggbbaa` when translucent). */
export function dtcgColor(color: string): string {
  const { hex, alpha } = splitTokenColor(color);
  return alpha >= 1 ? hex.toLowerCase() : (parseTokenColor(color) ?? hex).toLowerCase();
}

/** A DTCG color (hex text, or a 2025 color object in sRGB) as a token color, else `null`. */
export function readDtcgColor(value: unknown): string | null {
  if (typeof value === "string") return parseTokenColor(value);
  if (typeof value !== "object" || value === null) return null;
  const color = value as {
    colorSpace?: unknown;
    components?: unknown;
    alpha?: unknown;
    hex?: unknown;
  };
  const alpha = typeof color.alpha === "number" ? color.alpha : 1;
  if (typeof color.hex === "string") {
    const hex = parseTokenColor(color.hex);
    return hex && joinTokenColor(hex, alpha);
  }
  const parts = color.components;
  if (color.colorSpace !== "srgb" || !Array.isArray(parts) || parts.length < 3) return null;
  const byte = (n: unknown) =>
    Math.round(Math.min(1, Math.max(0, typeof n === "number" ? n : 0)) * 255)
      .toString(16)
      .padStart(2, "0");
  return joinTokenColor(`#${byte(parts[0])}${byte(parts[1])}${byte(parts[2])}`, alpha);
}

/** A number or a length (`16`, `"16px"`, `"1rem"`, `{ value, unit }`) in px, else `null`. */
export function readDimension(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const match = /^\s*(-?[\d.]+)\s*(px|rem|em|%)?\s*$/.exec(value);
    if (!match) return null;
    const n = Number(match[1]);
    if (!Number.isFinite(n)) return null;
    return match[2] === "rem" || match[2] === "em" ? n * REM : n;
  }
  if (typeof value === "object" && value !== null && "value" in value) {
    const { value: n, unit } = value as { value: unknown; unit?: unknown };
    if (typeof n !== "number") return null;
    return unit === "rem" || unit === "em" ? n * REM : n;
  }
  return null;
}

/** A px length as DTCG writes it. */
export function dtcgDimension(px: number): { value: number; unit: "px" } {
  return { value: px, unit: "px" };
}

/** `"{a.b.c}"` → `"a.b.c"`; `null` for anything else. */
export function referenceOf(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^\{([^{}]+)\}$/.exec(value.trim());
  return match?.[1]?.trim() ?? null;
}

/** A name fit for a DTCG path segment (no `.`, `{`, `}`, and not starting with `$`). */
export function dtcgSegment(name: string): string {
  return name.replace(/[.{}]/g, "-").replace(/^\$+/, "") || "_";
}

/** A font weight (a number, or a name like `bold`) as a CSS weight name (`"700"`), else `null`. */
export function readFontWeight(value: unknown): string | null {
  const names: Record<string, number> = {
    thin: 100,
    hairline: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    normal: 400,
    regular: 400,
    book: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? (names[value.toLowerCase().replace(/[\s-]/g, "")] ?? Number(value))
        : NaN;
  if (!Number.isFinite(n)) return null;
  return String(Math.min(900, Math.max(100, Math.round(n / 100) * 100)));
}
