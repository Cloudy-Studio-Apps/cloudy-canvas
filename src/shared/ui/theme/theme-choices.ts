import { themeRegistry } from "@shared/core";
import { useThemeStore } from "@shared/stores/theme-store";
import type { ThemeChoice } from "./theme.types";
import { t } from "./theme.i18n";

/** Every registered theme as a menu choice, plus "Match system". */
export function themeChoices(): ThemeChoice[] {
  const store = useThemeStore;
  const themes: ThemeChoice[] = themeRegistry.list().map(({ theme }) => ({
    id: theme.id,
    label: theme.label,
    active: () => store.getState().mode === "fixed" && store.getState().themeId === theme.id,
    select: () => store.getState().setTheme(theme.id),
  }));
  return [
    ...themes,
    {
      id: "system",
      label: t("menu.system"),
      active: () => store.getState().mode === "system",
      select: () => store.getState().setMode("system"),
    },
  ];
}
