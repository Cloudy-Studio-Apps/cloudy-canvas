import type { DataRow } from "./data-table.types";

const MAX_DEPTH = 4;

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isRowList = (v: unknown): v is DataRow[] =>
  Array.isArray(v) && v.length > 0 && v.every(isObject);

/** Turns parsed data into rows: a list of objects, a list of values, or the first list inside an object. */
export function normalizeRows(parsed: unknown): DataRow[] {
  if (Array.isArray(parsed)) {
    if (isRowList(parsed)) return parsed;
    return parsed.filter((v) => v !== undefined).map((value) => ({ value }));
  }
  if (!isObject(parsed)) return [];
  let level: DataRow[] = [parsed];
  for (let depth = 0; depth <= MAX_DEPTH && level.length > 0; depth++) {
    const next: DataRow[] = [];
    for (const obj of level) {
      for (const v of Object.values(obj)) {
        if (isRowList(v)) return v;
        if (isObject(v)) next.push(v);
      }
    }
    level = next;
  }
  return [parsed];
}
