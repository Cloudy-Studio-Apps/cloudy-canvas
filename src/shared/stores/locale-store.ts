import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { LocaleState } from "./locale-store.types";

export const LOCALE_STORAGE_KEY = "cloudy-canvas:locale";

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    { name: LOCALE_STORAGE_KEY, version: 1 },
  ),
);
