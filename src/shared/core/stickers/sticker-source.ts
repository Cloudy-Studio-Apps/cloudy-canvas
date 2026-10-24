import type { StickerSource } from "./sticker-pick.types";

/**
 * The sticker an element of any product shows (its `sticker`, `label` and `assetId`), or `null`
 * when it isn't one. Products read each other's stickers through it when pasting, never through
 * each other's types.
 */
export function stickerSourceOf(el: unknown): StickerSource | null {
  if (typeof el !== "object" || el === null) return null;
  const { type, sticker, label, assetId } = el as Record<string, unknown>;
  if (type !== "sticker" || typeof sticker !== "string" || typeof assetId !== "string") {
    return null;
  }
  return { sticker, label: typeof label === "string" ? label : sticker, assetId };
}
