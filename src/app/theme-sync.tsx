import { useEffect } from "react";

import { FORCE_LIGHT_THEME, useThemeStore } from "@stores/theme-store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Keeps the `.dark` class on <html> in sync with the stored preference and the system setting. */
export function ThemeSync() {
  const storedPreference = useThemeStore((s) => s.preference);
  const preference = FORCE_LIGHT_THEME ? "light" : storedPreference;

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const dark = preference === "dark" || (preference === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };

    apply();
    if (preference !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  return null;
}
