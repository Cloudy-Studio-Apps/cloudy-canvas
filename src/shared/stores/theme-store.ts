import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FALLBACK_THEME_IDS } from "@shared/core";
import type { ThemeState } from "./theme-store.types";

/** Must match the key read by the theme bootstrap script in index.html. */
export const THEME_STORAGE_KEY = "cloudy-canvas:theme";

/** The CSS of the theme last shown, written before first paint by index.html. */
export const THEME_CSS_KEY = "cloudy-canvas:theme-css";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "fixed",
      themeId: FALLBACK_THEME_IDS.light,
      lightThemeId: FALLBACK_THEME_IDS.light,
      darkThemeId: FALLBACK_THEME_IDS.dark,
      density: null,
      setMode: (mode) => set({ mode }),
      setTheme: (themeId) => set({ mode: "fixed", themeId }),
      setSystemTheme: (appearance, id) =>
        set(appearance === "light" ? { lightThemeId: id } : { darkThemeId: id }),
      setDensity: (density) => set({ density }),
    }),
    {
      name: THEME_STORAGE_KEY,
      version: 1,
      // Version 0 stored a light/dark/system `preference`.
      migrate: (persisted, version) => {
        if (version >= 1) return persisted as ThemeState;
        const { preference } = (persisted ?? {}) as { preference?: string };
        if (preference === "system") return { mode: "system" } as ThemeState;
        const themeId = preference === "dark" ? FALLBACK_THEME_IDS.dark : FALLBACK_THEME_IDS.light;
        return { mode: "fixed", themeId } as ThemeState;
      },
    },
  ),
);
