import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SnappingState } from "./snapping-store.types";

/** The user's snap settings per product, applied to every canvas of that product. */
export const useSnappingStore = create<SnappingState>()(
  persist(
    (set) => ({
      byProduct: {},
      save: (product, patch) =>
        set((state) => ({
          byProduct: { ...state.byProduct, [product]: { ...state.byProduct[product], ...patch } },
        })),
    }),
    { name: "cloudy-canvas:snapping" },
  ),
);
