import { splitTokenColor } from "../../token-color";
import { formatNumber, safeIdentifier } from "./code-names";
import type { CodeAxis, CodeTokens, CodeVariable } from "./code-tokens.types";

/** Which group a variable is listed in, in Swift and Kotlin. */
export function nativeGroup(v: CodeVariable): "colors" | "numbers" | "strings" | "flags" {
  if (v.type === "color") return "colors";
  if (v.type === "number") return "numbers";
  return v.type === "string" ? "strings" : "flags";
}

/** The red, green, blue (0–1) and alpha of a token color. */
export function rgba(color: string): { r: number; g: number; b: number; a: number } {
  const { hex, alpha } = splitTokenColor(color);
  const channel = (i: number) => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return { r: channel(0), g: channel(1), b: channel(2), a: alpha };
}

/** `0xAARRGGBB` for Compose's `Color(…)`. */
export function argbHex(color: string): string {
  const { hex, alpha } = splitTokenColor(color);
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `0x${a}${hex.slice(1)}`.toUpperCase().replace("0X", "0x");
}

/** The axis a variable is written as a function of: the first where it differs. */
export function axisOf(tokens: CodeTokens, v: CodeVariable): CodeAxis | null {
  const id = v.modes[0]?.axis;
  return tokens.axes.find((a) => a.id === id) ?? null;
}

/** Each mode of an axis with the variable's value there (its base where it doesn't differ). */
export function valuesByMode(axis: CodeAxis, v: CodeVariable) {
  return axis.modes.map((mode) => ({
    mode,
    value: v.modes.find((m) => m.axis === axis.id && m.mode === mode.id)?.value ?? v.base,
  }));
}

export { formatNumber, safeIdentifier };
