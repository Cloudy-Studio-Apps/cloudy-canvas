import type { ThemeDefinition } from "../theme.types";
import { CLOUDY_DARK } from "./cloudy-dark.theme";
import { CLOUDY_LIGHT } from "./cloudy-light.theme";
import { JETBRAINS_DARK } from "./jetbrains-dark.theme";

export { CLOUDY_DARK, CLOUDY_LIGHT, JETBRAINS_DARK };

/** The themes the app ships, in the chooser's order. */
export const BUILT_IN_THEMES: readonly ThemeDefinition[] = [
  CLOUDY_LIGHT,
  CLOUDY_DARK,
  JETBRAINS_DARK,
];

/** What every theme starts from, and what exports and thumbnails draw with. */
export const BASE_THEME_ID = CLOUDY_LIGHT.id;

/** Where a theme that isn't installed falls back to, by its appearance. */
export const FALLBACK_THEME_IDS = { light: CLOUDY_LIGHT.id, dark: CLOUDY_DARK.id } as const;
