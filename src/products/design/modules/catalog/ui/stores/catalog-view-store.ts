import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CatalogViewState } from "./catalog-view-store.types";

/** What the Catalog mode shows over the pages, kept between sessions (UI state only). */
export const useCatalogViewStore = create<CatalogViewState>()(
  persist(
    (set) => ({
      margins: false,
      setMargins: (margins) => set({ margins }),
    }),
    { name: "cloudy-canvas:catalog-view" },
  ),
);
