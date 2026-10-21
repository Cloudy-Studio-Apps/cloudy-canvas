import { useEffect, useMemo } from "react";

import { builtInSticker, type StickerDef } from "@board";
import { useCustomStickersStore } from "../../stores/custom-stickers-store";
import { useEmojiSections } from "./use-emoji-sections";

/**
 * Finds stickers by id among the built-in ones, the emojis and the user's library. Emojis and the
 * library are only loaded when one of `ids` needs them.
 */
export function useStickerLookup(ids: readonly string[]): (id: string) => StickerDef | undefined {
  const needsEmojis = ids.some((id) => id.startsWith("emoji:"));
  const needsCustom = ids.some((id) => id.startsWith("custom:"));
  const emojiSections = useEmojiSections(needsEmojis);
  const custom = useCustomStickersStore((state) => state.stickers);
  const loadCustom = useCustomStickersStore((state) => state.load);

  useEffect(() => {
    if (needsCustom) void loadCustom();
  }, [needsCustom, loadCustom]);

  return useMemo(() => {
    const found = new Map<string, StickerDef>();
    for (const section of emojiSections ?? []) {
      for (const sticker of section.stickers) found.set(sticker.id, sticker);
    }
    for (const sticker of custom) found.set(sticker.id, sticker);
    return (id: string) => builtInSticker(id) ?? found.get(id);
  }, [emojiSections, custom]);
}
