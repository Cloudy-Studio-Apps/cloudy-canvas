import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DesignViewState } from "./design-view-store.types";

/** What the design editor's canvas shows around its content (rulers, guides), kept between sessions. */
export const useDesignViewStore = create<DesignViewState>()(
  persist(
    (set) => ({
      rulers: true,
      guides: true,
      setRulers: (rulers) => set({ rulers }),
      setGuides: (guides) => set({ guides }),
    }),
    { name: "cloudy-canvas:design-view" },
  ),
);
