import { parsePath } from "./read-path";
import type { PathStep } from "./read-path.types";

/**
 * One key written as a path step: bare when it is a plain identifier (`price`, `$id`), else
 * quoted as `["…"]` with `\` and `"` escaped (spaces, hyphens, accents, digits first), the way
 * `parsePath` and template tokens read it back.
 */
export function keyStep(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `["${key.replace(/[\\"]/g, "\\$&")}"]`;
}

/** Adds a key to a path text: `a` + `b` → `a.b`, `a` + `x.y` → `a["x.y"]`. */
export function joinKey(base: string, key: string): string {
  const step = keyStep(key);
  if (!base) return step;
  return step.startsWith("[") ? base + step : `${base}.${step}`;
}

/** Steps written back as a path (`parsePath`'s inverse): keys quoted when needed, `[n]` indexes. */
export function formatPath(steps: PathStep[]): string {
  let out = "";
  for (const step of steps)
    out = "index" in step ? `${out}[${step.index}]` : joinKey(out, step.key);
  return out;
}

/** A path in its one written form (`a.b c` → `a["b c"]`), so old and new spellings compare equal; a path that doesn't parse stays as it is. */
export function normalizePath(path: string): string {
  try {
    return formatPath(parsePath(path));
  } catch {
    return path;
  }
}
