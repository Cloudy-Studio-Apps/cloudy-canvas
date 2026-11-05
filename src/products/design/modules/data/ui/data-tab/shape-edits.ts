import { isIncluded, shapedPath, type DataShape } from "../../table";

/** Every field's path after `shape`, kept or not, in the rows' order. */
function outputs(paths: readonly string[], shape: DataShape): string[] {
  return paths.map((path) => shapedPath(path, shape));
}

/**
 * The shape with the field at `path` (as read) kept or left out. Keeping every field again
 * clears `include`, so fields a later Update brings are kept too.
 */
export function withIncluded(
  shape: DataShape,
  paths: readonly string[],
  path: string,
  keep: boolean,
): DataShape {
  const all = outputs(paths, shape);
  const out = shapedPath(path, shape);
  const kept = all.filter((p) => isIncluded(p, shape) && p !== out);
  const include = keep ? [...kept, out] : kept;
  if (all.every((p) => include.includes(p))) return { rename: shape.rename };
  return { rename: shape.rename, include };
}

/**
 * The shape with the field at `path` (as read) renamed to `name` (empty, or its own path, takes
 * the rename away); a kept list follows the new name.
 */
export function withRenamed(shape: DataShape, path: string, name: string): DataShape {
  const before = shapedPath(path, shape);
  const rename = { ...shape.rename };
  const next = name.trim();
  if (!next || next === path) delete rename[path];
  else rename[path] = next;
  const after = shapedPath(path, { rename });
  if (!shape.include) return { rename };
  return { rename, include: shape.include.map((p) => (p === before ? after : p)) };
}
