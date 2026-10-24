import { useEffect, useMemo } from "react";

import { stickerCatalog, type StickerDef } from "@shared/core";
import { useCustomStickersStore } from "@shared/stores/custom-stickers-store";
import { useEmojiSections } from "./use-emoji-sections";
import { useStickerCatalogVersion } from "./use-sticker-sections";

/**
 * Finds stickers by id in the catalog (built-in, plugins' and emojis) and the user's library.
 * Emojis and the library are only loaded when one of `ids` needs them.
 */
export function useStickerLookup(ids: readonly string[]): (id: string) => StickerDef | undefined {
  const needsEmojis = ids.some((id) => id.startsWith("emoji:"));
  const needsCustom = ids.some((id) => id.startsWith("custom:"));
  useEmojiSections(needsEmojis);
  const version = useStickerCatalogVersion();
  const custom = useCustomStickersStore((state) => state.stickers);
  const loadCustom = useCustomStickersStore((state) => state.load);

  useEffect(() => {
    if (needsCustom) void loadCustom();
  }, [needsCustom, loadCustom]);

  return useMemo(() => {
    void version;
    const own = new Map(custom.map((sticker) => [sticker.id, sticker]));
    return (id: string) => stickerCatalog.get(id) ?? own.get(id);
  }, [version, custom]);
}
