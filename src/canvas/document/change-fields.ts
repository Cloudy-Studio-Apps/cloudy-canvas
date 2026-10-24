import type { DocumentChange } from "./canvas-document.types";

/** The fields that place an element (where it is, how big, how turned), not what it is. */
export const GEOMETRY_FIELDS: ReadonlySet<string> = new Set(["x", "y", "w", "h", "rotation"]);

/**
 * Whether a change only touched these fields of existing elements (nothing added or removed):
 * e.g. a drag only moves, which a layers list can ignore.
 */
export function changesOnly(change: DocumentChange, keys: ReadonlySet<string>): boolean {
  const { fields } = change;
  if (!fields || change.removed.size > 0) return false;
  for (const id of change.updated) {
    const changed = fields.get(id);
    if (!changed || changed === "all") return false;
    for (const key of changed) if (!keys.has(key)) return false;
  }
  return true;
}
