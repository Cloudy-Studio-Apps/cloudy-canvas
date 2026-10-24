import { FALLBACK_THEME_IDS, resolveTheme, themeRegistry } from "@shared/core";
import type { ThemeState } from "@shared/stores/theme-store.types";
import type { ActiveTheme } from "./theme.types";

/**
 * The theme `state` shows with the OS dark or not. A theme that isn't installed falls back to the
 * built-in one of the appearance last shown (`data-appearance`, kept from the last run), or of
 * `system` mode's slot.
 */
export function activeTheme(
  state: Pick<ThemeState, "mode" | "themeId" | "lightThemeId" | "darkThemeId">,
  systemDark: boolean,
): ActiveTheme {
  const system = state.mode === "system";
  const requestedId = system
    ? systemDark
      ? state.darkThemeId
      : state.lightThemeId
    : state.themeId;
  const found = themeRegistry.get(requestedId);
  const fallbackId = (system ? systemDark : document.documentElement.dataset.appearance === "dark")
    ? FALLBACK_THEME_IDS.dark
    : FALLBACK_THEME_IDS.light;
  const definition = found ?? themeRegistry.get(fallbackId) ?? themeRegistry.base();
  return {
    requestedId,
    definition,
    resolved: resolveTheme(definition, themeRegistry),
    missing: !found,
  };
}
