import type { ThemeDensity } from "@shared/core";

/** `fixed` shows one theme; `system` follows the OS between a light and a dark one. */
export type ThemeMode = "fixed" | "system";

export interface ThemeState {
  mode: ThemeMode;
  /** The theme shown in `fixed` mode. */
  themeId: string;
  /** What `system` mode shows when the OS is light. */
  lightThemeId: string;
  /** What `system` mode shows when the OS is dark. */
  darkThemeId: string;
  /** The user's density over the theme's own; `null` keeps the theme's. */
  density: ThemeDensity | null;
  setMode: (mode: ThemeMode) => void;
  setTheme: (id: string) => void;
  setSystemTheme: (appearance: "light" | "dark", id: string) => void;
  setDensity: (density: ThemeDensity | null) => void;
}
