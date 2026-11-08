import type { CanvasDocument, ElementKinds, ElementPatch } from "@canvas";

import type { DesignNode, Paint } from "../core";

/**
 * Points every layer's image paints showing the picture `from` at the picture `to` instead,
 * keeping how they place it, as one edit (the caller sets the undo step). Returns how many layers
 * changed.
 */
export function relinkImageAsset(
  doc: CanvasDocument,
  kinds: ElementKinds,
  from: string,
  to: string,
): number {
  const swap = (paints: Paint[]): Paint[] =>
    paints.map((paint) =>
      paint.type === "image" && paint.assetId === from ? { ...paint, assetId: to } : paint,
    );
  const patches = new Map<string, ElementPatch<DesignNode>>();
  for (const el of doc.all()) {
    if (!kinds.kindOf(el).assets(el).includes(from)) continue;
    const node = el as DesignNode;
    patches.set(el.id, { fills: swap(node.fills), strokes: swap(node.strokes) });
  }
  if (patches.size > 0) doc.updateMany(patches);
  return patches.size;
}
