import type { CanvasDocument, ElementPatch } from "@canvas";
import { stickerAssetId, stickerCatalog, stickerPicture } from "@shared/core";

import type { StickerNodeElement } from "./sticker.types";

/** Whether a sticker's die-cut edge can be recolored (a built-in or plugin art sticker). */
export function canRestyleEdge(el: StickerNodeElement): boolean {
  return stickerCatalog.get(el.sticker)?.restyle !== undefined;
}

/**
 * The patches that give stickers this edge color (`null`: their own), with the pictures they
 * need stored first (assets are outside the undo history). Stickers whose edge can't change are
 * left out. Async: emoji ids load the catalog's emojis first.
 */
export async function stickerEdgePatches(
  doc: CanvasDocument,
  stickers: readonly StickerNodeElement[],
  edgeColor: string | null,
): Promise<Map<string, ElementPatch>> {
  const patches = new Map<string, ElementPatch>();
  for (const el of stickers) {
    const def = await stickerCatalog.find(el.sticker);
    if (!def?.restyle) continue;
    const look = edgeColor ? { edgeColor } : null;
    const assetId = stickerAssetId(def.id, look);
    if (!doc.hasAsset(assetId)) doc.addAsset(assetId, await stickerPicture(def, look));
    const patch: ElementPatch<StickerNodeElement> = { edgeColor, assetId };
    patches.set(el.id, patch as ElementPatch);
  }
  return patches;
}
