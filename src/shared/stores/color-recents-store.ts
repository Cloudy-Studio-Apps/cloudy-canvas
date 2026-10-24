import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ColorRecentsState } from "./color-recents-store.types";

/** How many recent colors are kept. */
const MAX_RECENTS = 16;

/**
 * The colors picked last in any color picker of the app (both products' paints, palettes, effects),
 * kept between sessions. App UI state: the colors themselves are the documents'.
 */
export const useColorRecentsStore = create<ColorRecentsState>()(
  persist(
    (set) => ({
      colors: [],
      add: (color) =>
        set(({ colors }) => ({
          colors: [color, ...colors.filter((c) => c !== color)].slice(0, MAX_RECENTS),
        })),
    }),
    { name: "cloudy-canvas:color-recents" },
  ),
);
