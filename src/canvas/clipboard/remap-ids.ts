/**
 * A deep copy of JSON data with every string found in `ids` replaced by its value. Element ids are
 * UUIDs, so this rewrites references between elements (`ownerId`, `ref.tableId`, …) without
 * knowing where each type keeps them.
 */
export function remapIds<T>(value: T, ids: ReadonlyMap<string, string>): T {
  return remap(value, ids) as T;
}

function remap(value: unknown, ids: ReadonlyMap<string, string>): unknown {
  if (typeof value === "string") return ids.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => remap(item, ids));
  if (typeof value === "object" && value !== null) {
    const copy: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) copy[key] = remap(item, ids);
    return copy;
  }
  return value;
}
