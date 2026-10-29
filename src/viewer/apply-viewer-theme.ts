import { resolveTheme, themeCss, themeRegistry } from "@shared/core";

/** The viewer is always in the app's base (light) theme: its tokens on `:root`. */
export function applyViewerTheme(): void {
  const style = document.createElement("style");
  style.textContent = themeCss(resolveTheme(themeRegistry.base(), themeRegistry));
  document.head.appendChild(style);
  document.documentElement.dataset.appearance = "light";
}
