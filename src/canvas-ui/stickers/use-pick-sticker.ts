import { useCallback } from "react";

import { pickSticker, type PickedSticker, type StickerDef } from "@shared/core";
import { useStickerRecentsStore } from "@shared/stores/sticker-recents-store";
import { notifyError } from "@shared/stores/toast-store";

/**
 * Loads a sticker's picture and hands it to `onPicked` (the product makes it what its sticker
 * tool stamps). With `keep`, it also goes to the front of the wheel (picks from the wheel itself
 * don't reorder it).
 */
export function usePickSticker(
  onPicked: (sticker: PickedSticker) => void,
): (sticker: StickerDef, keep?: boolean) => Promise<void> {
  const remember = useStickerRecentsStore((state) => state.use);

  return useCallback(
    async (sticker, keep = false) => {
      try {
        onPicked(await pickSticker(sticker));
        if (keep) remember(sticker.id);
      } catch (error) {
        notifyError(`Couldn't pick "${sticker.label}"`, error);
      }
    },
    [onPicked, remember],
  );
}
