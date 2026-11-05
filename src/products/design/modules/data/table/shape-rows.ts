import type { DataRow } from "./data-table.types";
import { joinKey, normalizePath } from "./path-text";
import { parsePath } from "./read-path";
import type { PathStep } from "./read-path.types";
import type { DataShape } from "./shape.types";

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Every field of a value, as `guessFields` finds them: an object's keys, deep; a list is one. */
function leaves(value: unknown, path: string, out: [string, unknown][]): void {
  if (isObject(value) && Object.keys(value).length > 0) {
    for (const key of Object.keys(value)) leaves(value[key], joinKey(path, key), out);
    return;
  }
  out.push([path, value]);
}

/** The fields of a row with their values, in order, by path (`dimensions.width`). */
export function rowFields(row: DataRow): [string, unknown][] {
  const out: [string, unknown][] = [];
  for (const key of Object.keys(row)) leaves(row[key], joinKey("", key), out);
  return out;
}

/** Whether a shape changes nothing (no rename, every field kept). */
export function isPlainShape(shape: DataShape | null | undefined): boolean {
  return !shape || (Object.keys(shape.rename).length === 0 && shape.include === undefined);
}

/** What a field's path is after `shape`: its new path, or the same. */
export function shapedPath(path: string, shape: DataShape | null | undefined): string {
  if (!shape) return path;
  const normal = normalizePath(path);
  const renamed = shape.rename[normal] ?? shape.rename[path];
  return renamed === undefined ? normal : normalizePath(renamed);
}

/** Whether a field, by its path after `shape`, is kept: all are while `include` is unset. */
export function isIncluded(path: string, shape: DataShape | null | undefined): boolean {
  const include = shape?.include;
  if (!include) return true;
  const normal = normalizePath(path);
  return include.some((entry) => {
    const kept = normalizePath(entry);
    return kept === normal || normal.startsWith(`${kept}.`) || normal.startsWith(`${kept}[`);
  });
}

/** Writes `value` at `steps` inside `row`, making the groups on the way; a value in the way wins. */
function writeAt(row: DataRow, steps: readonly PathStep[], value: unknown): void {
  let cur: DataRow = row;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as PathStep;
    const key = "key" in step ? step.key : String(step.index);
    if (i === steps.length - 1) {
      if (!Object.hasOwn(cur, key)) cur[key] = value;
      return;
    }
    const next = cur[key];
    if (next === undefined) {
      const made: DataRow = {};
      cur[key] = made;
      cur = made;
    } else if (isObject(next)) cur = next;
    else return;
  }
}

/**
 * Rows as `shape` makes them: each row rebuilt from its fields (`rowFields`), each under its new
 * path (`rename`) and only the ones `include` keeps. Without a shape, or with one that changes
 * nothing, the rows as they are. The rows given are never written.
 */
export function shapeRows(
  rows: readonly DataRow[],
  shape: DataShape | null | undefined,
): DataRow[] {
  if (!shape || isPlainShape(shape)) return [...rows];
  const steps = new Map<string, PathStep[] | null>();
  /** Where a field goes, `null` when it's left out (or its new path doesn't parse). */
  const target = (path: string): PathStep[] | null => {
    const known = steps.get(path);
    if (known !== undefined) return known;
    const next = shapedPath(path, shape);
    let out: PathStep[] | null = null;
    if (isIncluded(next, shape)) {
      try {
        out = parsePath(next);
      } catch {
        out = null;
      }
    }
    steps.set(path, out);
    return out;
  };
  return rows.map((row) => {
    const out: DataRow = {};
    if (!isObject(row)) return out;
    for (const [path, value] of rowFields(row)) {
      const to = target(path);
      if (to) writeAt(out, to, value);
    }
    return out;
  });
}
