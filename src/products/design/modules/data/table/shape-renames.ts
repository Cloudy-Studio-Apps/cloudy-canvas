import { shapedPath } from "./shape-rows";
import type { DataShape } from "./shape.types";

/**
 * What changing a source's shape from `before` to `after` renames, as bindings read the fields:
 * each path under `before` → its path under `after`, for every field either shape renames (the
 * others keep their path). A field `after` leaves out is still listed: what reads it then finds
 * nothing, as for any field gone.
 */
export function shapeRenames(
  before: DataShape | null | undefined,
  after: DataShape | null | undefined,
): Map<string, string> {
  const renames = new Map<string, string>();
  const paths = new Set([
    ...Object.keys(before?.rename ?? {}),
    ...Object.keys(after?.rename ?? {}),
  ]);
  for (const path of paths) {
    const from = shapedPath(path, before);
    const to = shapedPath(path, after);
    if (from !== to) renames.set(from, to);
  }
  return renames;
}
