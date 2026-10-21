import { useCallback } from "react";

import { fetchStickerBytes, stickerAssetId, type StickerDef } from "@board";
import { notifyError } from "@shared/stores/toast-store";
import { useBoardEngine } from "../../board-engine-context";
import { useStickerRecentsStore } from "../../stores/sticker-recents-store";

/** Pictures already fetched, by sticker id (custom ones never change under the same id). */
const pictures = new Map<string, Promise<Uint8Array>>();

function pictureOf(sticker: StickerDef): Promise<Uint8Array> {
  let picture = pictures.get(sticker.id);
  if (!picture) {
    picture = fetchStickerBytes(sticker.url);
    pictures.set(sticker.id, picture);
    picture.catch(() => pictures.delete(sticker.id));
  }
  return picture;
}

/**
 * Makes a sticker the one the sticker tool stamps. With `keep`, it also goes to the front of
 * the wheel (picks from the wheel itself don't reorder it).
 */
export function usePickSticker(): (sticker: StickerDef, keep?: boolean) => Promise<void> {
  const engine = useBoardEngine();
  const remember = useStickerRecentsStore((state) => state.use);

  return useCallback(
    async (sticker, keep = false) => {
      try {
        const data = await pictureOf(sticker);
        engine.setToolOptions({
          sticker: {
            sticker: sticker.id,
            label: sticker.label,
            assetId: stickerAssetId(sticker.id),
            data,
          },
        });
        if (keep) remember(sticker.id);
      } catch (error) {
        notifyError(`Couldn't pick "${sticker.label}"`, error);
      }
    },
    [engine, remember],
  );
}
