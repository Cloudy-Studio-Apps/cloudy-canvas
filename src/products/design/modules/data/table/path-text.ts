import type { PathStep } from "./read-path.types";

/** One key written as a path step: bare when it is plain, else quoted as `["…"]`. */
export function keyStep(key: string): string {
  return /^[^.[\]"]+$/.test(key) && !/^\d+$/.test(key) ? key : `[${JSON.stringify(key)}]`;
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
