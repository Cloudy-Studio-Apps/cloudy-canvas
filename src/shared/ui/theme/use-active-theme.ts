import { useMemo, useSyncExternalStore } from "react";

import { themeRegistry, type RegisteredTheme } from "@shared/core";
import { useThemeStore } from "@shared/stores/theme-store";
import { activeTheme } from "./active-theme";
import { onSystemAppearance, systemIsDark } from "./system-appearance";
import type { ActiveTheme } from "./theme.types";

/** The theme the app shows, kept current as the user, the OS or the plugins change it. */
export function useActiveTheme(): ActiveTheme {
  const mode = useThemeStore((s) => s.mode);
  const themeId = useThemeStore((s) => s.themeId);
  const lightThemeId = useThemeStore((s) => s.lightThemeId);
  const darkThemeId = useThemeStore((s) => s.darkThemeId);
  const systemDark = useSyncExternalStore(onSystemAppearance, systemIsDark);
  const themes = useSyncExternalStore(
    (listener) => themeRegistry.subscribe(listener),
    () => themeRegistry.getVersion(),
  );
  return useMemo(() => {
    void themes; // resolved again when a plugin's theme comes or goes
    return activeTheme({ mode, themeId, lightThemeId, darkThemeId }, systemDark);
  }, [mode, themeId, lightThemeId, darkThemeId, systemDark, themes]);
}

/** The registered themes, kept current. */
export function useThemes(): readonly RegisteredTheme[] {
  useSyncExternalStore(
    (listener) => themeRegistry.subscribe(listener),
    () => themeRegistry.getVersion(),
  );
  return themeRegistry.list();
}
