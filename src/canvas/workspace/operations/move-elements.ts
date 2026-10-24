import type { ElementPatch } from "../../elements";
import type { Point } from "../../geometry.types";
import { withMembers } from "./members";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * Moves each element, with what moves with it (locked ones stay put), by its own offset.
 * Returns the moved ids. The caller starts the undo step.
 */
export function moveElementsBy(
  parts: WorkspaceParts,
  offsets: ReadonlyMap<string, Point>,
): string[] {
  const { doc, kinds } = parts;
  const patches = new Map<string, ElementPatch>();
  for (const [id, { x, y }] of offsets) {
    if (x === 0 && y === 0) continue;
    for (const member of withMembers(parts, [id], "move")) {
      const el = doc.get(member);
      if (el && !el.locked) patches.set(member, kinds.kindOf(el).move(el, x, y));
    }
  }
  if (patches.size > 0) doc.updateMany(patches);
  return [...patches.keys()];
}
