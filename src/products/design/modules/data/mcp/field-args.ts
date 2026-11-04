import type { ToolArgs } from "@canvas";

import type { DataField, DataSourceElement, FieldFormat, FieldType } from "../source";

/** Every field type, for validating what an agent sets. */
export const FIELD_TYPES: readonly FieldType[] = [
  "text",
  "integer",
  "number",
  "currency",
  "boolean",
  "date",
  "color",
  "url",
  "image-url",
  "image-base64",
  "image-file",
  "list",
  "object",
];

const FORMAT_KEYS = [
  "decimals",
  "currency",
  "dateStyle",
  "prefix",
  "suffix",
  "trueText",
  "falseText",
] as const;

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
  if (TEXT_FORMAT_KEYS.has(key) && typeof value !== "string") {
    throw new Error(`${where} must be text.`);
  }
  return value;
}

function readFieldFormat(value: unknown, where: string): FieldFormat {
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

/** The source's fields with an agent's `fields` patches applied by path; unknown paths are errors. */
export function patchFields(source: DataSourceElement, args: ToolArgs): DataField[] | undefined {
  const patches = args.fields;
  if (patches === undefined || patches === null) return undefined;
  if (!Array.isArray(patches)) throw new Error('"fields" must be an array of objects.');
  const fields = source.fields.map((f) => ({ ...f }));
  patches.forEach((patch: unknown, i) => {
    const where = `fields[${i}]`;
    if (typeof patch !== "object" || patch === null) throw new Error(`${where} must be an object.`);
    const p = patch as Record<string, unknown>;
    const field = fields.find((f) => f.path === p.path);
    if (typeof p.path !== "string" || !field) {
      throw new Error(`${where}: no field "${String(p.path)}" (see get_data_source).`);
    }
    if (p.alias !== undefined) {
      if (typeof p.alias !== "string") throw new Error(`${where}.alias must be text.`);
      if (p.alias === "") delete field.alias;
      else field.alias = p.alias;
    }
    if (p.type !== undefined) {
      if (!FIELD_TYPES.includes(p.type as FieldType)) {
        throw new Error(`${where}.type must be one of: ${FIELD_TYPES.join(", ")}.`);
      }
      field.type = p.type as FieldType;
    }
    if (p.format !== undefined) field.format = readFieldFormat(p.format, where);
    if (p.hidden !== undefined) {
      if (typeof p.hidden !== "boolean") throw new Error(`${where}.hidden must be true or false.`);
      field.hidden = p.hidden;
    }
  });
  return fields;
}
