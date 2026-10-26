import type { ThemeDefinition } from "../theme.types";
import { BLACK } from "./black.theme";
import { CATPPUCCIN_LATTE } from "./catppuccin-latte.theme";
import { CATPPUCCIN_MOCHA } from "./catppuccin-mocha.theme";
import { CLOUDY_DARK } from "./cloudy-dark.theme";
import { CLOUDY_LIGHT } from "./cloudy-light.theme";
import { DRACULA } from "./dracula.theme";
import { GRUVBOX_DARK } from "./gruvbox-dark.theme";
import { HIGH_CONTRAST_DARK } from "./high-contrast-dark.theme";
import { HIGH_CONTRAST_LIGHT } from "./high-contrast-light.theme";
import { JETBRAINS_DARK } from "./jetbrains-dark.theme";
import { JETBRAINS_LIGHT } from "./jetbrains-light.theme";
import { LILAC } from "./lilac.theme";
import { NORD } from "./nord.theme";
import { ORANGE_LIGHT } from "./orange-light.theme";
import { PAPER } from "./paper.theme";
import { ROSE_PINE } from "./rose-pine.theme";
import { ROSE_PINE_DAWN } from "./rose-pine-dawn.theme";
import { SAND } from "./sand.theme";
import { SOLARIZED_DARK } from "./solarized-dark.theme";
import { SOLARIZED_LIGHT } from "./solarized-light.theme";
import { TERMINAL } from "./terminal.theme";

export {
  BLACK,
  CATPPUCCIN_LATTE,
  CATPPUCCIN_MOCHA,
  CLOUDY_DARK,
  CLOUDY_LIGHT,
  DRACULA,
  GRUVBOX_DARK,
  HIGH_CONTRAST_DARK,
  HIGH_CONTRAST_LIGHT,
  JETBRAINS_DARK,
  JETBRAINS_LIGHT,
  LILAC,
  NORD,
  ORANGE_LIGHT,
  PAPER,
  ROSE_PINE,
  ROSE_PINE_DAWN,
  SAND,
  SOLARIZED_DARK,
  SOLARIZED_LIGHT,
  TERMINAL,
};

/** The themes the app ships, in the chooser's order: the app's own first, then pairs by family. */
export const BUILT_IN_THEMES: readonly ThemeDefinition[] = [
  CLOUDY_LIGHT,
  CLOUDY_DARK,
  SAND,
  LILAC,
  ORANGE_LIGHT,
  BLACK,
  HIGH_CONTRAST_LIGHT,
  HIGH_CONTRAST_DARK,
  PAPER,
  SOLARIZED_LIGHT,
  SOLARIZED_DARK,
  CATPPUCCIN_LATTE,
  CATPPUCCIN_MOCHA,
  ROSE_PINE_DAWN,
  ROSE_PINE,
  JETBRAINS_LIGHT,
  JETBRAINS_DARK,
  NORD,
  DRACULA,
  GRUVBOX_DARK,
  TERMINAL,
];

/** What every theme starts from, and what exports and thumbnails draw with. */
export const BASE_THEME_ID = CLOUDY_LIGHT.id;

/** Where a theme that isn't installed falls back to, by its appearance. */
export const FALLBACK_THEME_IDS = { light: CLOUDY_LIGHT.id, dark: CLOUDY_DARK.id } as const;
