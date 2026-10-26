import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PaletteFavoritesState } from "./palette-favorites-store.types";

const keyOf = (palette: readonly string[]) => palette.join("-");

/**
 * The palettes saved from the color wizard's gallery, kept between sessions. App UI state: a file
 * only gets the colors when a palette is used.
 */
export const usePaletteFavoritesStore = create<PaletteFavoritesState>()(
  persist(
    (set) => ({
      palettes: [],
      toggle: (palette) =>
        set(({ palettes }) => {
          const key = keyOf(palette);
          return palettes.some((p) => keyOf(p) === key)
            ? { palettes: palettes.filter((p) => keyOf(p) !== key) }
            : { palettes: [[...palette], ...palettes] };
        }),
    }),
    { name: "cloudy-canvas:palette-favorites" },
  ),
);
