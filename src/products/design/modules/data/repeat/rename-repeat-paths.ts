import { renamePath } from "../bindings";
import type { PathRewrite } from "./field-renamer.types";

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Each `{ path }` of a list rewritten, `null` when none changed. */
function rewrittenRules(list: unknown, rewrite: PathRewrite): unknown[] | null {
  if (!Array.isArray(list)) return null;
  let changed = false;
  const out = list.map((rule: unknown) => {
    if (!isObject(rule) || typeof rule.path !== "string") return rule;
    const path = rewrite(rule.path);
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
  const rename: PathRewrite = (path) => renamePath(path, from, to);
  return rewriteRepeatPaths(repeat, {
    ...(parts.source ? { source: rename } : {}),
    ...(parts.row ? { row: rename } : {}),
  });
}

/**
 * A stored `repeat` with its paths rewritten: its `source` by `rewrite.source` (read in the
 * frame's scope), its row paths (`key`, `filter`, `sort`, read in the row's scope) by
 * `rewrite.row`; a rewrite left out leaves those alone. `null` when nothing changed. Works on the
 * record as stored, so fields this version doesn't know are kept.
 */
export function rewriteRepeatPaths(
  repeat: unknown,
  rewrite: { source?: PathRewrite; row?: PathRewrite },
): Record<string, unknown> | null {
  if (!isObject(repeat)) return null;
  const out: Record<string, unknown> = { ...repeat };
  let changed = false;
  const apply = (field: "source" | "key", by: PathRewrite) => {
    const value = out[field];
    const next = typeof value === "string" ? by(value) : null;
    if (next !== null) [out[field], changed] = [next, true];
  };
  if (rewrite.source) apply("source", rewrite.source);
  if (rewrite.row) {
    apply("key", rewrite.row);
    for (const field of ["filter", "sort"] as const) {
      const next = rewrittenRules(out[field], rewrite.row);
      if (next) [out[field], changed] = [next, true];
    }
  }
  return changed ? out : null;
}
