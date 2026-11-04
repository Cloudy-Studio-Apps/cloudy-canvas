import { formatPath, parsePath } from "../table";

/** `path` with its first name `from` swapped for `to`; `null` when it names something else (or isn't a path). */
export function renamePath(path: string, from: string, to: string): string | null {
  try {
    const steps = parsePath(path);
    const first = steps[0];
    if (!first || !("key" in first) || first.key !== from) return null;
    return formatPath([{ key: to }, ...steps.slice(1)]);
  } catch {
    return null;
  }
}
