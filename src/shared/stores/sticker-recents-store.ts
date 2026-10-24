import { create } from "zustand";
import { persist } from "zustand/middleware";

import { COMMON_STICKERS } from "@shared/core";
import type { StickerRecentsState } from "./sticker-recents-store.types";

/** How many stickers the wheel holds. */
export const WHEEL_SLOTS = 8;

/** The stickers used last (app UI state, kept between sessions), starting with the common ones. */
export const useStickerRecentsStore = create<StickerRecentsState>()(
  persist(
    (set) => ({
      recents: COMMON_STICKERS.map((sticker) => sticker.id),
      use: (id) =>
        set(({ recents }) => ({
          recents: [id, ...recents.filter((recent) => recent !== id)].slice(0, WHEEL_SLOTS * 2),
        })),
    }),
    { name: "cloudy-canvas:sticker-recents" },
  ),
);
