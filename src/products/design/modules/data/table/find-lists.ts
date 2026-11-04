import type { DataExtraValue, DataList } from "./find-lists.types";
import { joinKey } from "./path-text";
import { readPath } from "./read-path";
import type { DataRow } from "./data-table.types";

const MAX_DEPTH = 4;
const MAX_LISTS = 20;
const MAX_EXTRAS = 8;
const MAX_EXTRA_TEXT = 120;

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const isRowList = (v: unknown): v is DataRow[] =>
  Array.isArray(v) && v.length > 0 && v.every(isObject);

/**
 * The lists of objects in parsed data that could be its rows, outermost first and in key order
 * (the first is the one `normalizeRows` picks). Lists inside a list's items are their rows' own
 * (a product's reviews), not candidates.
 */
export function findLists(parsed: unknown): DataList[] {
  if (Array.isArray(parsed)) return isRowList(parsed) ? [{ path: "", count: parsed.length }] : [];
  const found: DataList[] = [];
  let level: { path: string; value: DataRow }[] = isObject(parsed)
    ? [{ path: "", value: parsed }]
    : [];
  for (let depth = 0; depth <= MAX_DEPTH && level.length > 0; depth++) {
    const next: typeof level = [];
    for (const { path, value } of level) {
      for (const [key, v] of Object.entries(value)) {
        const at = joinKey(path, key);
        if (isRowList(v)) found.push({ path: at, count: v.length });
        else if (isObject(v)) next.push({ path: at, value: v });
        if (found.length >= MAX_LISTS) return found;
      }
    }
    level = next;
  }
  return found;
}

/** The plain values at the top of an object (`total: 194`), long texts cut, at most 8. */
export function extraValues(parsed: unknown): Record<string, DataExtraValue> {
  const extras: Record<string, DataExtraValue> = {};
  if (!isObject(parsed)) return extras;
  for (const [key, v] of Object.entries(parsed)) {
    if (Object.keys(extras).length >= MAX_EXTRAS) break;
    if (typeof v === "string")
      extras[key] = v.length > MAX_EXTRA_TEXT ? `${v.slice(0, MAX_EXTRA_TEXT)}…` : v;
    else if (v === null || typeof v === "number" || typeof v === "boolean") extras[key] = v;
  }
  return extras;
}

/**
 * The value a rows path names (`""`: the data itself), or `undefined` when nothing is there or
 * the path doesn't parse.
 */
export function valueAtRowsPath(parsed: unknown, path: string): unknown {
  if (path === "") return parsed;
  try {
    return readPath(parsed, path);
  } catch {
    return undefined;
  }
}
