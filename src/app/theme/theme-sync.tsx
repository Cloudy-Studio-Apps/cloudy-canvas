import { useLayoutEffect } from "react";

import { useThemeStore } from "@shared/stores/theme-store";
import { notifyThemeChange, useActiveTheme } from "@shared/ui/theme";
import { applyTheme } from "./apply-theme";

/** Keeps the page in the active theme as the user, the OS and plugins change it. */
export function ThemeSync() {
  const theme = useActiveTheme();
  const density = useThemeStore((s) => s.density);

  useLayoutEffect(() => {
    applyTheme(theme, density);
    notifyThemeChange();
  }, [theme, density]);

  return null;
}
