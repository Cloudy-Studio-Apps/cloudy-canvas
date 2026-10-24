import type { ThemeDensity, ThemeMetrics } from "./theme.types";

/** Control and row sizes per density, in px. `default` is the app's original look. */
export const DENSITY_METRICS: Readonly<Record<ThemeDensity, ThemeMetrics>> = {
  compact: { controlHeight: 26, controlHeightSm: 24, controlHeightLg: 32, rowHeight: 24 },
  default: { controlHeight: 32, controlHeightSm: 28, controlHeightLg: 40, rowHeight: 28 },
  comfortable: { controlHeight: 36, controlHeightSm: 32, controlHeightLg: 44, rowHeight: 32 },
};

/** Horizontal padding inside controls, in px. */
export const DENSITY_PADDING: Readonly<Record<ThemeDensity, number>> = {
  compact: 10,
  default: 14,
  comfortable: 16,
};
