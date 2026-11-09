import type { CanvasDocument, ElementKinds, ElementPatch } from "@canvas";

/**
 * Points every element showing the picture `from` at the picture `to` instead, through its kind's
 * `relinkAsset` (image fills and strokes, a vector area's own fills; kinds without it are
 * skipped), as one edit (the caller sets the undo step). Returns how many elements changed.
 */
export function relinkImageAsset(
  doc: CanvasDocument,
  kinds: ElementKinds,
  from: string,
  to: string,
): number {
  const patches = new Map<string, ElementPatch>();
  for (const el of doc.all()) {
    const kind = kinds.kindOf(el);
    if (!kind.assets(el).includes(from)) continue;
    const patch = kind.relinkAsset(el, from, to);
    if (patch) patches.set(el.id, patch);
  }
  if (patches.size > 0) doc.updateMany(patches);
  return patches.size;
}
