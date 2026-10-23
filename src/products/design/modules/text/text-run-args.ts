import { clearRunFields, normalizeRuns, runsForText, type TextDecoration } from "@canvas";

import { colorPaints, readPaints } from "../core";
import { textFields } from "./text-args";
import type { TextNodeElement, TextNodeRun, TextRunStyle } from "./text.types";

const DECORATIONS: readonly TextDecoration[] = ["none", "underline", "strikethrough"];

/** The run style fields agents give, in the schemas. */
export const RUN_STYLE_PROPERTIES = {
  fontFamily: { type: "string" },
  fontSize: { type: "number" },
  fontWeight: { enum: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] },
  fontStyle: { enum: ["normal", "italic"] },
  lineHeight: { type: "number", description: "A multiple of the font size." },
  letterSpacing: { type: "number" },
  color: { type: "string", description: "Its color (or a CSS gradient), as its fills." },
  fills: { type: "array", items: { type: "object" }, description: "Paints (see create_nodes)." },
  textDecoration: { enum: DECORATIONS },
};

/** An agent's text decoration, checked. */
export function textDecoration(value: unknown, key = "textDecoration"): TextDecoration {
  if (!DECORATIONS.includes(value as TextDecoration)) {
    throw new Error(`"${key}" must be one of: ${DECORATIONS.join(", ")}.`);
  }
  return value as TextDecoration;
}

/** A range's style from an agent: typography, `color` or `fills`, `textDecoration`. */
export function readRunStyle(value: unknown, key: string): TextRunStyle {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`"${key}" must be an object of text style fields.`);
  }
  const fields = value as Record<string, unknown>;
  const typography = textFields(fields);
  const style: TextRunStyle = {};
  for (const field of [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "lineHeight",
    "letterSpacing",
  ] as const) {
    if (typography[field] !== undefined) Object.assign(style, { [field]: typography[field] });
  }
  if (fields.fills !== undefined) style.fills = readPaints(fields.fills, `${key}.fills`, false);
  else if (typeof fields.color === "string")
    style.fills = colorPaints(fields.color, `${key}.color`);
  if (fields.textDecoration !== undefined) {
    style.textDecoration = textDecoration(fields.textDecoration, `${key}.textDecoration`);
  }
  return style;
}

/**
 * An agent's runs for a text `length` characters long: `{ start, end, …style }` each (`end`
 * excluded), checked against the text and normalized.
 */
export function readRuns(value: unknown, length: number, key = "runs"): TextNodeRun[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array of ranges.`);
  const runs = value.map((item, i): TextNodeRun => {
    const at = `${key}[${i}]`;
    if (typeof item !== "object" || item === null) throw new Error(`"${at}" must be an object.`);
    const { start, end, style, ...rest } = item as Record<string, unknown>;
    return { ...readRange(start, end, length, at), style: readRunStyle(style ?? rest, at) };
  });
  return normalizeRuns(runs, length);
}

/** A `start`–`end` range inside a text `length` characters long. */
export function readRange(
  start: unknown,
  end: unknown,
  length: number,
  key: string,
): { start: number; end: number } {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error(`"${key}" needs whole-number "start" and "end".`);
  }
  const a = start as number;
  const b = end as number;
  if (a < 0 || b > length || a >= b) {
    throw new Error(`"${key}" must have 0 ≤ start < end ≤ ${length} (the text's length).`);
  }
  return { start: a, end: b };
}

/** Fields that, set on the text, set all of it (its ranges lose their own). */
const WHOLE_TEXT_FIELDS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "fills",
  "textDecoration",
] as const;

/**
 * The runs a patch of a text leads to (`{}` when they stay): its own `runs` checked, or the
 * text's moved onto a new text and cleared of what the patch sets for the whole text.
 */
export function runsPatch(
  el: TextNodeElement,
  patch: Readonly<Record<string, unknown>>,
): { runs?: TextNodeRun[] } {
  const text = typeof patch.text === "string" ? patch.text : el.text;
  if (patch.runs !== undefined) return { runs: readRuns(patch.runs, text.length) };
  let runs = text === el.text ? el.runs : runsForText(el.runs, el.text, text);
  const whole = WHOLE_TEXT_FIELDS.filter((field) => field in patch);
  if (whole.length > 0) runs = clearRunFields(runs, whole, text.length);
  return runs === el.runs ? {} : { runs };
}
