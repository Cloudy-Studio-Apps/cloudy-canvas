/** A variable name as a clean slash path: `" Brand / primary//500 "` → `"Brand/primary/500"`. */
export function normalizeTokenPath(name: string): string {
  return name
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("/");
}

/** The groups a path sits in: `"brand/primary/500"` → `"brand/primary"` (`""` at the top). */
export function tokenGroupOf(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "" : path.slice(0, slash);
}

/** A path's own name: `"brand/primary/500"` → `"500"`. */
export function tokenLeafOf(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

/** Whether `path` is in the group `group` (at any depth; `""` holds everything). */
export function inTokenGroup(path: string, group: string): boolean {
  return group === "" || path === group || path.startsWith(`${group}/`);
}

/**
 * `path` with the group `from` renamed to `to` (`"brand/x"`, `"brand"` → `"core"`: `"core/x"`),
 * or `null` when it isn't in that group.
 */
export function renamePrefix(path: string, from: string, to: string): string | null {
  if (!from || !inTokenGroup(path, from)) return null;
  return normalizeTokenPath(`${to}/${path.slice(from.length)}`);
}
