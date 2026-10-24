import { DENSITY_METRICS, type ThemeMetrics } from "@shared/core";
import { useThemeStore } from "@shared/stores/theme-store";
import { useActiveTheme } from "./use-active-theme";

/** The control and row sizes of the theme shown (the user's density first), in px. */
export function useThemeMetrics(): ThemeMetrics {
  const theme = useActiveTheme();
  const density = useThemeStore((s) => s.density);
  return DENSITY_METRICS[density ?? theme.resolved.density];
}
