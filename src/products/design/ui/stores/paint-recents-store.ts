import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PaintRecentsState } from "./paint-recents-store.types";

/** How many recent colors the paint picker keeps. */
const MAX_RECENTS = 16;

/** The colors picked last in the paint picker (app UI state, kept between sessions). */
export const usePaintRecentsStore = create<PaintRecentsState>()(
  persist(
    (set) => ({
      colors: [],
      add: (color) =>
        set(({ colors }) => ({
          colors: [color, ...colors.filter((c) => c !== color)].slice(0, MAX_RECENTS),
        })),
    }),
    { name: "cloudy-canvas:paint-recents" },
  ),
);
