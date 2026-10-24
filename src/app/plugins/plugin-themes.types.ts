import type { onThemeChange, useActiveTheme } from "@shared/ui/theme";
import type { THEME_TOKEN_NAMES, ThemeDefinition } from "@shared/core";

/**
 * A theme a plugin adds: a `ThemeDefinition`, checked when it's registered (unknown tokens are
 * left out with a warning in the console). Its `preview` may be left out when its tokens give
 * the four colors.
 */
export type PluginTheme = Omit<ThemeDefinition, "preview"> & {
  preview?: ThemeDefinition["preview"];
};

/** `api.themes`: themes for the chooser in Settings › Appearance, and the active theme. */
export interface PluginThemesApi {
  /** Adds a theme. Its id must be unique among every theme (built-in ones included). */
  register(theme: PluginTheme): void;
  /** The theme the app shows (React): its id, appearance and resolved tokens. */
  useActiveTheme: typeof useActiveTheme;
  /** Calls the listener when the theme changes, for drawing that reads tokens. */
  onThemeChange: typeof onThemeChange;
  /** Every token a theme can set. */
  tokens: typeof THEME_TOKEN_NAMES;
}

/** What a plugin's `activate` staged: registered once it succeeds. */
export interface PluginThemeStage {
  api: PluginThemesApi;
  /** Adds the staged themes to `themeRegistry`; returns how many. Throws on a clash. */
  commit(): number;
}
