import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DesignPanelState } from "./design-panel-store.types";

/** The design editor's panel UI state (never canvas content), kept between sessions. */
export const useDesignPanelStore = create<DesignPanelState>()(
  persist(
    (set) => ({
      leftTab: "layers",
      propertiesTab: "design",
      assetsView: "grid",
      leftOpen: true,
      rightOpen: true,
      setLeftTab: (leftTab) => set({ leftTab }),
      setPropertiesTab: (propertiesTab) => set({ propertiesTab }),
      setAssetsView: (assetsView) => set({ assetsView }),
      setLeftOpen: (leftOpen) => set({ leftOpen }),
      setRightOpen: (rightOpen) => set({ rightOpen }),
    }),
    { name: "cloudy-canvas:design-panels" },
  ),
);
