import { create } from "zustand";

import { importStickerFiles, stickerLibrary } from "@platform";
import type { CustomSticker, StickerDef, StickerImage } from "@shared/core";
import { notifyError, toast } from "./toast-store";
import type { CustomStickersState } from "./custom-stickers-store.types";
import { t } from "./stores.i18n";

/** Larger pictures are refused: every stamp copies the file into the board. */
const MAX_BYTES = 2 * 1024 * 1024;
const PREFIX = "custom:";

let loading: Promise<void> | null = null;

/** The user's custom stickers (their own library, never canvas content). */
export const useCustomStickersStore = create<CustomStickersState>()((set, get) => ({
  stickers: [],
  loaded: false,
  load: () => {
    loading ??= (async () => {
      try {
        const library = await stickerLibrary.list();
        const stickers = await Promise.all(
          library.map(async (s) => toDef(s, await stickerLibrary.read(s.id))),
        );
        set({ stickers, loaded: true });
      } catch (error) {
        loading = null;
        notifyError(t("stickers.loadFailed"), error);
      }
    })();
    return loading;
  },
  importFiles: async () => {
    try {
      const images = await importStickerFiles();
      const fitting = images.filter((image) => image.data.byteLength <= MAX_BYTES);
      if (fitting.length < images.length) {
        toast({
          title: t("stickers.tooLarge"),
          description: t("stickers.maxSize"),
        });
      }
      const added = await Promise.all(fitting.map(addImage));
      set({ stickers: [...get().stickers, ...added] });
    } catch (error) {
      notifyError(t("stickers.importFailed"), error);
    }
  },
  remove: async (id) => {
    try {
      await stickerLibrary.remove(id.slice(PREFIX.length));
      const removed = get().stickers.find((sticker) => sticker.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      set({ stickers: get().stickers.filter((sticker) => sticker.id !== id) });
    } catch (error) {
      notifyError(t("stickers.removeFailed"), error);
    }
  },
}));

async function addImage(image: StickerImage): Promise<StickerDef> {
  return toDef(await stickerLibrary.add(image), image.data);
}

function toDef(sticker: CustomSticker, data: Uint8Array): StickerDef {
  const blob = new Blob([data as Uint8Array<ArrayBuffer>], { type: sticker.type });
  return {
    id: `${PREFIX}${sticker.id}`,
    label: sticker.name,
    keywords: [],
    url: URL.createObjectURL(blob),
  };
}
