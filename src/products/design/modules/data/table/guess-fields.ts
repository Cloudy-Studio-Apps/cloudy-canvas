import type { DataField, FieldType } from "../source";
import type { DataRow } from "./data-table.types";

const SAMPLE_ROWS = 200;
const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?\S*)?(#\S*)?$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isEmpty = (v: unknown): boolean => v === null || v === undefined || v === "";

function keyStep(key: string): string {
  return /^[^.[\]"]+$/.test(key) && !/^\d+$/.test(key) ? key : `[${JSON.stringify(key)}]`;
}

function join(base: string, key: string): string {
  const step = keyStep(key);
  if (!base) return step;
  return step.startsWith("[") ? base + step : `${base}.${step}`;
}

/** The type of one non-empty value. */
function guessValue(v: unknown): FieldType {
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  if (Array.isArray(v)) return "list";
  if (typeof v !== "string") return "text";
  const s = v.trim();
  if (s === "true" || s === "false") return "boolean";
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

/** The fields found in the first rows, in order of first appearance; known fields keep their settings. */
export function guessFields(rows: DataRow[], keep: DataField[]): DataField[] {
  const found = new Map<string, FieldType | null>();
  for (const row of rows.slice(0, SAMPLE_ROWS)) {
    if (isObject(row)) for (const k of Object.keys(row)) collect(row[k], join("", k), found);
  }
  const known = new Map(keep.map((f) => [f.path, f]));
  return [...found].map(([path, type]) => known.get(path) ?? { path, type: type ?? "text" });
}
