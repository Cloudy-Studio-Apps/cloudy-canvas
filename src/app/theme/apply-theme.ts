import { resolveTheme, themeCss, themeRegistry, type ThemeDensity } from "@shared/core";
import { THEME_CSS_KEY } from "@shared/stores/theme-store";
import type { ActiveTheme } from "@shared/ui/theme";
import { EXPORT_THEME_SCOPE } from "@canvas-ui";

/** The `<style>` the theme is written into; index.html creates it from the cache before paint. */
const STYLE_ID = "cloudy-theme";

/**
 * Writes `theme`'s CSS (and the base theme's for the export scope, so exports and thumbnails
 * keep their own colors), marks `<html>` with the theme and its appearance (`.dark` keeps
 * Tailwind's `dark:` variant working) and caches the CSS for the next start.
 */
export function applyTheme(theme: ActiveTheme, density: ThemeDensity | null): void {
  const css = [
    themeCss(theme.resolved, ":root", density ?? undefined),
    themeCss(resolveTheme(themeRegistry.base(), themeRegistry), `.${EXPORT_THEME_SCOPE}`),
  ].join("\n");
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;

  const root = document.documentElement;
  const dark = theme.resolved.appearance === "dark";
  root.dataset.theme = theme.definition.id;
  root.dataset.appearance = theme.resolved.appearance;
  root.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_CSS_KEY, JSON.stringify({ css, dark }));
  } catch {
    // The cache only avoids a flash on the next start.
  }
}
