import { joinTokenColor, parseTokenColor } from "../../token-color";
import type { TokenValue } from "../../token.types";
import { readDimension, readFontWeight } from "../dtcg/dtcg-values";
import type { StudioType } from "./tokens-studio.types";

/** Tokens Studio's types that become variables. */
export const STUDIO_TYPES: Record<string, StudioType> = {
  color: { type: "color", scopes: [] },
  spacing: { type: "number", scopes: ["gap", "padding"] },
  sizing: { type: "number", scopes: ["width-height"] },
  dimension: { type: "number", scopes: [] },
  borderRadius: { type: "number", scopes: ["corner-radius"] },
  borderWidth: { type: "number", scopes: ["stroke-weight"] },
  fontSizes: { type: "number", scopes: ["font-size"] },
  letterSpacing: { type: "number", scopes: ["letter-spacing"] },
  paragraphSpacing: { type: "number", scopes: [] },
  lineHeights: { type: "number", scopes: ["line-height"] },
  fontWeights: { type: "number", scopes: ["font-weight"] },
  opacity: { type: "number", scopes: ["opacity"] },
  number: { type: "number", scopes: [] },
  fontFamilies: { type: "string", scopes: ["font-family"] },
  text: { type: "string", scopes: [] },
  other: { type: "string", scopes: [] },
  boolean: { type: "boolean", scopes: [] },
};

/** `{a.b}` as `a.b`; `null` when the value isn't only one reference. */
export function studioReference(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^\s*\{([^{}]+)\}\s*$/.exec(value);
  return match?.[1]?.trim() ?? null;
}

/** Whether a value is worked out (`{space} * 2`, `rgba({red}, 0.5)`), not a plain reference. */
export function isExpression(value: unknown): boolean {
  return typeof value === "string" && /\{[^}]+\}/.test(value) && studioReference(value) === null;
}

/** A raw value of a Tokens Studio type, or `null` when it can't be read. */
export function studioValue(studioType: string, raw: unknown): TokenValue | null {
  const type = STUDIO_TYPES[studioType]?.type;
  if (type === "color") {
    const color = typeof raw === "string" ? (parseTokenColor(raw) ?? rgbColor(raw)) : null;
    return color ? { color } : null;
  }
  if (type === "string") return typeof raw === "string" ? { string: raw } : null;
  if (type === "boolean") {
    if (typeof raw === "boolean") return { boolean: raw };
    return raw === "true" || raw === "false" ? { boolean: raw === "true" } : null;
  }
  if (studioType === "fontWeights") {
    const weight = readFontWeight(raw);
    return weight ? { number: Number(weight) } : null;
  }
  if (studioType === "opacity") {
    const n = percentOr(raw);
    return n === null
      ? null
      : { number: n.percent ? n.value : n.value <= 1 ? n.value * 100 : n.value };
  }
  if (studioType === "lineHeights") {
    const n = percentOr(raw);
    if (n === null) return null;
    // A multiplier; a length can't be one without the font size.
    if (n.percent) return { number: n.value / 100 };
    return n.value <= 4 ? { number: n.value } : null;
  }
  const n = readDimension(raw);
  return n === null ? null : { number: n };
}

function percentOr(raw: unknown): { value: number; percent: boolean } | null {
  if (typeof raw === "number") return { value: raw, percent: false };
  if (typeof raw !== "string") return null;
  const match = /^\s*(-?[\d.]+)\s*(%)?\s*$/.exec(raw);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? { value, percent: match[2] === "%" } : null;
}

function rgbColor(raw: string): string | null {
  const match =
    /^\s*rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)\s*$/i.exec(raw);
  if (!match) return null;
  const hex = [match[1], match[2], match[3]]
    .map((n) =>
      Math.min(255, Math.round(Number(n)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  const a = match[4];
  const alpha = a === undefined ? 1 : a.endsWith("%") ? Number.parseFloat(a) / 100 : Number(a);
  return joinTokenColor(`#${hex}`, Number.isFinite(alpha) ? alpha : 1);
}
