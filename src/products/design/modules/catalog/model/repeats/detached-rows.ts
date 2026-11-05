import type { DetachedSlot } from "./brochure-repeat.types";

/** The rows a page taken out of a repeat showed: its `rows`, else (older entries) its copy path. */
export function detachedRows(detached: DetachedSlot): readonly string[] {
  return detached.rows ?? detached.path;
}
