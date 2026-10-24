import { useMemo, useSyncExternalStore } from "react";

import { stickerCatalog, type StickerSection, type StickerTab } from "@shared/core";

const subscribe = (listener: () => void) => stickerCatalog.subscribe(listener);
const version = () => stickerCatalog.getVersion();

/** The catalog's groups of a tab, read again when plugins or the emojis add stickers. */
export function useStickerSections(tab: StickerTab): readonly StickerSection[] {
  const current = useSyncExternalStore(subscribe, version);
  return useMemo(() => {
    void current;
    return stickerCatalog.sections(tab);
  }, [tab, current]);
}

/** The catalog's version, for memos over `stickerCatalog.get`. */
export function useStickerCatalogVersion(): number {
  return useSyncExternalStore(subscribe, version);
}
