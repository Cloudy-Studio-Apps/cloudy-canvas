import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AutosaveState } from "./autosave-store.types";

export const useAutosaveStore = create<AutosaveState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "cloudy-canvas:autosave" },
  ),
);
