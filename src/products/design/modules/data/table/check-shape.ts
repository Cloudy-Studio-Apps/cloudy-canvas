import type { DataRow } from "./data-table.types";
import { formatPath } from "./path-text";
import { parsePath } from "./read-path";
import { isIncluded, rowFields, shapedPath } from "./shape-rows";
import type { DataShape } from "./shape.types";
import { collisionMessage, groupMessage } from "./shape-errors";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** A path of keys in its one written form; throws naming `what` when it isn't one. */
function keyPath(value: unknown, what: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${what} is empty.`);
  let steps;
  try {
    steps = parsePath(value.trim());
  } catch {
    throw new Error(`${what} isn't a field path: ${value}`);
  }
  if (steps.some((step) => "index" in step)) {
    throw new Error(`${what} can't hold a list position: ${value}`);
  }
  return formatPath(steps);
}

/**
 * A shape as given (an agent's, a file's) checked and written in one form: `rename` an object of
 * field path to new path (paths of keys; one renamed to itself is dropped), `include` a list of
 * paths or left out. `null` stays `null` (no step). Throws an English error naming what's wrong.
 */
export function readShape(value: unknown): DataShape | null {
  if (value === null) return null;
  if (!isObject(value)) throw new Error('"shape" must be an object or null.');
  const rename: Record<string, string> = {};
  if (value.rename !== undefined) {
    if (!isObject(value.rename)) throw new Error('"shape.rename" must be an object.');
    for (const [from, to] of Object.entries(value.rename)) {
      const path = keyPath(from, "A renamed field's path");
      const next = keyPath(to, `The new name of "${from}"`);
      if (next !== path) rename[path] = next;
    }
  }
  if (value.include === undefined || value.include === null) return { rename };
  if (!Array.isArray(value.include)) throw new Error('"shape.include" must be a list of paths.');
  const include = [...new Set(value.include.map((p: unknown) => keyPath(p, "A kept field")))];
  return { rename, include };
}

/** Every field the rows have (`rowFields`), in order of first appearance. */
export function fieldPaths(rows: readonly DataRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) for (const [path] of rowFields(row)) seen.add(path);
  return [...seen];
}

/**
 * Throws when `shape` over fields at `paths` (the rows as read) would put two fields at one path,
 * or a field where another holds a group (`a` and `a.b`). Pure.
 */
export function checkShape(shape: DataShape, paths: readonly string[]): void {
  const taken = new Map<string, string>();
  for (const path of paths) {
    const next = shapedPath(path, shape);
    if (!isIncluded(next, shape)) continue;
    const other = taken.get(next);
    if (other !== undefined) {
      throw new Error(collisionMessage(next, path, other));
    }
    taken.set(next, path);
  }
  for (const [next, path] of taken) {
    for (const [inside, from] of taken) {
      if (inside !== next && (inside.startsWith(`${next}.`) || inside.startsWith(`${next}[`))) {
        throw new Error(groupMessage(next, path, from));
      }
    }
  }
}
