import type { FieldType } from "../source";

/** The field types whose text values are numbers however they're written ("1e3", " 12 "). */
const NUMERIC_TYPES: ReadonlySet<FieldType> = new Set(["integer", "number", "currency"]);

/** Plain decimal text: no leading zeros (but "0" and "0.5"), no exponent, hex or spaces inside. */
const PLAIN_DECIMAL = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

/**
 * A value read as a finite number, else `null`: a number, or a string holding one. A string is
 * a number when its field is numeric (`integer`, `number`, `currency`) or when it is plain
 * decimal text, so a code like "007" or "0x1A" stays text.
 */
export function toNumber(value: unknown, type?: FieldType | null): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const text = value.trim();
  if (!(type && NUMERIC_TYPES.has(type)) && !PLAIN_DECIMAL.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** A value read as a boolean: a boolean, or `"true"`/`"false"` in any case; else `null`. */
export function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return null;
}
