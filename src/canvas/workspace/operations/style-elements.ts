import type { ElementPatch, ElementStyle } from "../../elements";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * Applies a look (`ElementKind.styleFields`) to the unlocked elements among `ids`, as one undo
 * step. Returns the ids that changed.
 */
export function applyStyle(
  { doc, kinds, scene }: WorkspaceParts,
  style: ElementStyle,
  ids: Iterable<string>,
): string[] {
  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const el = scene.get(id);
    if (!el || el.locked) continue;
    const patch = kinds.kindOf(el).applyStyle(el, style);
    if (Object.keys(patch).length > 0) patches.set(id, patch);
  }
  if (patches.size === 0) return [];
  doc.checkpoint();
  doc.updateMany(patches);
  return [...patches.keys()];
}

/**
 * Applies the look of `fromId` to `ids` as Paste properties does, without touching what Copy
 * properties took (agents). Returns the ids that changed.
 */
export function applyStyleOf(
  parts: WorkspaceParts,
  fromId: string,
  ids: Iterable<string>,
): string[] {
  const from = parts.scene.get(fromId);
  return from ? applyStyle(parts, parts.kinds.kindOf(from).styleOf(from), ids) : [];
}
