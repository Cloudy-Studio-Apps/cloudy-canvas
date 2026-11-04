import type { DataField, FieldType } from "../source";
import type { DataRow } from "./data-table.types";
import { joinKey as join, normalizePath } from "./path-text";

const SAMPLE_ROWS = 200;
const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?\S*)?(#\S*)?$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isEmpty = (v: unknown): boolean => v === null || v === undefined || v === "";

/** The type of one non-empty value. */
function guessValue(v: unknown): FieldType {
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  if (Array.isArray(v)) return "list";
  if (typeof v !== "string") return "text";
  const s = v.trim();
  if (s === "true" || s === "false") return "boolean";
  // A leading zero ("007", "01234") is a code, not a number: it would be lost as one.
  if (/^-?0\d/.test(s)) return "text";
  if (/^-?\d+$/.test(s)) return "integer";
  if (/^-?\d*\.\d+$/.test(s)) return "number";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return "color";
  if (s.startsWith("data:image/")) return "image-base64";
  if (/^https?:\/\//i.test(s)) return IMAGE_URL.test(s) ? "image-url" : "url";
  if (ISO_DATE.test(s) && !Number.isNaN(Date.parse(s))) return "date";
  return "text";
}

function widen(a: FieldType, b: FieldType): FieldType {
  if (a === b) return a;
  if ((a === "integer" && b === "number") || (a === "number" && b === "integer")) return "number";
  return "text";
}

function collect(value: unknown, path: string, into: Map<string, FieldType | null>): void {
  if (isObject(value)) {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      for (const k of keys) collect(value[k], join(path, k), into);
      return;
    }
    if (!path) return;
  }
  if (!path) return;
  const prev = into.get(path);
  if (isEmpty(value)) {
    if (prev === undefined) into.set(path, null);
    return;
  }
  const type = guessValue(value);
  into.set(path, prev ? widen(prev, type) : type);
}

/**
 * The fields found in the first rows, in order of first appearance; known fields keep their
 * settings (as copies). Fields in `keep` that the rows don't have are appended unchanged, in
 * their order, so a partial or empty refresh never wipes them.
 */
export function guessFields(rows: DataRow[], keep: DataField[]): DataField[] {
  const found = new Map<string, FieldType | null>();
  for (const row of rows.slice(0, SAMPLE_ROWS)) {
    if (isObject(row)) for (const k of Object.keys(row)) collect(row[k], join("", k), found);
  }
  // Matched by their one written form, so a field saved as `a.b c` is the `a["b c"]` found now.
  const known = new Map(keep.map((f) => [normalizePath(f.path), f]));
  const fields = [...found].map(([path, type]): DataField => {
    const old = known.get(path);
    return old ? { ...old, path } : { path, type: type ?? "text" };
  });
  for (const f of keep) if (!found.has(normalizePath(f.path))) fields.push({ ...f });
  return fields;
}
