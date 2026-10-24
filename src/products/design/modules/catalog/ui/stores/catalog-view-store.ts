import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CatalogViewState } from "./catalog-view-store.types";

/** What the Catalog mode shows over the pages and in its preview, kept between sessions (UI state only). */
export const useCatalogViewStore = create<CatalogViewState>()(
  persist(
    (set) => ({
      margins: false,
      setMargins: (margins) => set({ margins }),
      preview3d: true,
      setPreview3d: (preview3d) => set({ preview3d }),
    }),
    { name: "cloudy-canvas:catalog-view" },
  ),
);
