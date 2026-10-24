import type { ElementPatch } from "../../elements";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * Locks or unlocks elements, as one undo step (see `CanvasElement.locked`). Returns the ids
 * that changed.
 */
export function setLocked(
  { doc, scene }: WorkspaceParts,
  ids: Iterable<string>,
  locked: boolean,
): string[] {
  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const el = scene.get(id);
    if (el && Boolean(el.locked) !== locked) patches.set(id, { locked });
  }
  if (patches.size === 0) return [];
  doc.checkpoint();
  doc.updateMany(patches);
  return [...patches.keys()];
}
