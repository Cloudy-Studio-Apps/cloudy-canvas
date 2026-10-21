import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "system" | "light" | "dark";

/**
 * Light-only while the design system is being built. Flip to `false` to bring back dark mode
 * (also update the matching flag in index.html and render <ThemeToggle /> in the top bar).
 */
export const FORCE_LIGHT_THEME: boolean = true;

/** Must match the key read by the theme bootstrap script in index.html. */
export const THEME_STORAGE_KEY = "cloudy-canvas:theme";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
