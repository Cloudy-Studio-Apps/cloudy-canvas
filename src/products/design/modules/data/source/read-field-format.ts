import type { FieldFormat } from "./data-source.types";

const FORMAT_KEYS = [
  "decimals",
  "currency",
  "dateStyle",
  "prefix",
  "suffix",
  "trueText",
  "falseText",
  "list",
] as const;

const LIST_SHOWS = ["all", "first", "count"] as const;

const DATE_STYLES = ["short", "medium", "long"] as const;
const TEXT_FORMAT_KEYS = new Set(["prefix", "suffix", "trueText", "falseText"]);

/** One `format` value checked by its key (`where` names it in the error). */
function readFormatValue(key: string, value: unknown, where: string): unknown {
  if (key === "decimals") {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 20) {
      throw new Error(`${where} must be a whole number from 0 to 20.`);
    }
    return value;
  }
  if (key === "currency") {
    if (typeof value !== "string" || !/^[a-z]{3}$/i.test(value)) {
      throw new Error(`${where} must be a 3-letter ISO currency code, e.g. USD or EUR.`);
    }
    return value.toUpperCase();
  }
  if (key === "dateStyle") {
    if (!(DATE_STYLES as readonly unknown[]).includes(value)) {
      throw new Error(`${where} must be one of: ${DATE_STYLES.join(", ")}.`);
    }
    return value;
  }
  if (key === "list") {
    if (!(LIST_SHOWS as readonly unknown[]).includes(value)) {
      throw new Error(`${where} must be one of: ${LIST_SHOWS.join(", ")}.`);
    }
    return value;
  }
  if (TEXT_FORMAT_KEYS.has(key) && typeof value !== "string") {
    throw new Error(`${where} must be text.`);
  }
  return value;
}

/** A field or binding `format` checked key by key (`where` names it in errors); currency upper-cased. */
export function readFieldFormat(value: unknown, where: string): FieldFormat {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${where}.format must be an object.`);
  }
  const format: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    if (!(FORMAT_KEYS as readonly string[]).includes(key)) {
      throw new Error(`${where}.format has no "${key}" (use ${FORMAT_KEYS.join(", ")}).`);
    }
    format[key] = readFormatValue(key, v, `${where}.format.${key}`);
  }
  return format as FieldFormat;
}
