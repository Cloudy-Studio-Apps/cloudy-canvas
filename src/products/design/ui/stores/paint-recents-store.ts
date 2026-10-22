import { create } from "zustand";
import { persist } from "zustand/middleware";

import { gradientKey } from "@canvas";
import type { PaintRecentsState } from "./paint-recents-store.types";

/** How many recent colors the paint picker keeps. */
const MAX_RECENTS = 16;
/** How many recent gradients it keeps. */
const MAX_RECENT_GRADIENTS = 8;

/** The colors and gradients picked last in the paint picker (app UI state, kept between sessions). */
export const usePaintRecentsStore = create<PaintRecentsState>()(
  persist(
    (set) => ({
      colors: [],
      gradients: [],
      add: (color) =>
        set(({ colors }) => ({
          colors: [color, ...colors.filter((c) => c !== color)].slice(0, MAX_RECENTS),
        })),
      addGradient: ({ type, stops, transform, interpolation }) =>
        set(({ gradients }) => {
          const gradient = { type, stops, transform, ...(interpolation ? { interpolation } : {}) };
          const key = gradientKey(gradient);
          return {
            gradients: [gradient, ...gradients.filter((g) => gradientKey(g) !== key)].slice(
              0,
              MAX_RECENT_GRADIENTS,
            ),
          };
        }),
    }),
    // Older saves have no gradients; they start empty.
    {
      name: "cloudy-canvas:paint-recents",
      merge: (saved, current) => ({ ...current, ...(saved as Partial<PaintRecentsState>) }),
    },
  ),
);
