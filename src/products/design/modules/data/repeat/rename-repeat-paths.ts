import { renamePath } from "../bindings";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Each `{ path }` of a list with its first name renamed, `null` when none changed. */
function renamedRules(list: unknown, from: string, to: string): unknown[] | null {
  if (!Array.isArray(list)) return null;
  let changed = false;
  const out = list.map((rule: unknown) => {
    if (!isObject(rule) || typeof rule.path !== "string") return rule;
    const path = renamePath(rule.path, from, to);
    if (path === null) return rule;
    changed = true;
    return { ...rule, path };
  });
  return changed ? out : null;
}

/**
 * A stored `repeat` with `from` renamed to `to` where it names it: its `source` (read in the
 * frame's scope) when `source` is set, and its row paths (`key`, `filter`, `sort`, read in the
 * row's scope) when `row` is. `null` when nothing changed. Works on the record as stored, so
 * fields this version doesn't know are kept.
 */
export function renameRepeatPaths(
  repeat: unknown,
  from: string,
  to: string,
  parts: { source: boolean; row: boolean },
): Record<string, unknown> | null {
  if (!isObject(repeat)) return null;
  const out: Record<string, unknown> = { ...repeat };
  let changed = false;
  const rename = (field: "source" | "key") => {
    const value = out[field];
    const next = typeof value === "string" ? renamePath(value, from, to) : null;
    if (next !== null) [out[field], changed] = [next, true];
  };
  if (parts.source) rename("source");
  if (parts.row) {
    rename("key");
    for (const field of ["filter", "sort"] as const) {
      const next = renamedRules(out[field], from, to);
      if (next) [out[field], changed] = [next, true];
    }
  }
  return changed ? out : null;
}
