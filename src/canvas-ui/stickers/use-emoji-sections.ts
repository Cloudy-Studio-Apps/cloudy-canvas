import { useEffect } from "react";

import { stickerCatalog, type StickerSection } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { useStickerCatalogVersion, useStickerSections } from "./use-sticker-sections";
import { t } from "./stickers.i18n";

/** The emoji groups once the catalog's emojis are loaded (`null` before, or while not `enabled`). */
export function useEmojiSections(enabled = true): readonly StickerSection[] | null {
  useStickerCatalogVersion();
  const loaded = stickerCatalog.emojisLoaded();
  const sections = useStickerSections("emojis");

  useEffect(() => {
    if (!enabled || loaded) return;
    stickerCatalog.loadEmojis().catch((error: unknown) => {
      notifyError(t("errors.emojis"), error);
    });
  }, [enabled, loaded]);

  return enabled && loaded ? sections : null;
}
