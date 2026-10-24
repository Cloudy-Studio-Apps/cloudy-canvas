import type { THEME_TOKEN_NAMES } from "./theme-tokens";

export type ThemeTokenName = (typeof THEME_TOKEN_NAMES)[number];

/** Token values by name (CSS values: a color, `var(--seal-900)`, …). */
export type ThemeTokens = Partial<Record<ThemeTokenName, string>>;

export type ThemeAppearance = "light" | "dark";

/** How tight controls and rows are. */
export type ThemeDensity = "compact" | "default" | "comfortable";

export interface ThemeFonts {
  /** The UI's font stack. */
  sans?: string;
  /** Code, numbers in fields that ask for it. */
  mono?: string;
}

/** Corner radii in px; each is clamped to 8 (the UI stays sharp). */
export interface ThemeCorners {
  /** Buttons, inputs, chips. */
  control?: number;
  /** Cards, menus, popovers. */
  card?: number;
  /** Dialogs. */
  max?: number;
}

/** The four colors a theme's card in Settings is drawn with. */
export interface ThemePreview {
  background: string;
  surface: string;
  primary: string;
  foreground: string;
}

/**
 * A theme: what it changes over the one it `extends` (Cloudy Light when unset), so it only lists
 * what differs.
 */
export interface ThemeDefinition {
  id: string;
  label: string;
  description?: string;
  appearance: ThemeAppearance;
  /** The theme it starts from. */
  extends?: string;
  tokens: ThemeTokens;
  /** Tokens set inside one product's editor (`[data-product="<id>"]`), e.g. the design's canvas. */
  products?: Readonly<Record<string, ThemeTokens>>;
  fonts?: ThemeFonts;
  density?: ThemeDensity;
  corners?: ThemeCorners;
  preview: ThemePreview;
}

/** A theme with its whole chain merged in: every value set. */
export interface ResolvedTheme {
  id: string;
  label: string;
  appearance: ThemeAppearance;
  tokens: ThemeTokens;
  products: Record<string, ThemeTokens>;
  fonts: Required<ThemeFonts>;
  density: ThemeDensity;
  corners: Required<ThemeCorners>;
}

/** Sizes that follow the density, for code that lays out in pixels (virtual lists). */
export interface ThemeMetrics {
  controlHeight: number;
  controlHeightSm: number;
  controlHeightLg: number;
  rowHeight: number;
}

/** A registered theme and who added it (`app`, or a plugin's id). */
export interface RegisteredTheme {
  theme: ThemeDefinition;
  owner: string;
}

/** A plugin's theme once checked, and the token names it gave that don't exist. */
export interface ReadThemeResult {
  theme: ThemeDefinition;
  ignored: string[];
}
