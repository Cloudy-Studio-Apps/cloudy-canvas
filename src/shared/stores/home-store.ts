import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { HomeState } from "./home-store.types";

/** Home's own choices (the seals card, grid or list), kept between sessions. */
export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      sealsHidden: false,
      recentView: "grid",
      setSealsHidden: (sealsHidden) => set({ sealsHidden }),
      setRecentView: (recentView) => set({ recentView }),
    }),
    { name: "cloudy-canvas:home" },
  ),
);
