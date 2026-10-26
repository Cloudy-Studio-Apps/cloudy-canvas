import type { CvdKind } from "../color";
import type { FillRef } from "../sources";

/** The Theme collection's modes. */
export type ThemeMode = "Light" | "Dark";

/** Which modes the Theme collection gets. */
export type ModeSet = "both" | "light" | "dark";

/** A palette color with the role it plays (its variable group). */
export interface WizardRole {
  name: string;
  hex: string;
  include: boolean;
  /** The layers' paints it came from (collected from the file), bound to it when made. */
  fills?: FillRef[];
}

/** What gets made besides the roles' colors. */
export interface WizardOptions {
  /** 50–950 shades per color (a shade generator each), else one variable per color. */
  shades: boolean;
  /** A gray tinted with the primary's hue, when no role is "neutral". */
  neutral: boolean;
  /** Success, warning, error and info, nudged toward the primary. */
  status: boolean;
  /** The Theme collection (semantic tokens aliasing the shades). */
  theme: boolean;
  modes: ModeSet;
}

/** A color that becomes a variable group. */
export interface WizardColor {
  name: string;
  hex: string;
  /** Added by an option (the neutral, the status colors), not one of the user's. */
  added: boolean;
  fills?: FillRef[];
}

/**
 * What a token uses in a mode, when the user picked it: a palette role's `stop`, `white`,
 * `black`, `auto` (white or black for contrast, on `*-foreground`) or `custom` (`hex`).
 */
export interface ThemeChoice {
  role?: string;
  stop?: number;
  hex?: string;
}

/** The user's choices: token → mode → choice. Tokens and modes left out use the defaults. */
export type ThemeOverrides = Record<string, Partial<Record<ThemeMode, ThemeChoice>>>;

/** A Theme token's defaults. */
export interface ThemeTokenSpec {
  name: string;
  group: "Surfaces" | "Text" | "Brand" | "Status";
  description: string;
  /** The role it reads (the first one that exists), or `auto`. */
  role: string | readonly string[];
  /** Its shade per mode, or `white`. */
  Light: number | "white" | null;
  Dark: number | "white" | null;
  /** Falls back to the primary (or the first color) when its role is missing. */
  core?: boolean;
  /** For `auto`: the token it's read on. */
  on?: string;
}

/** A token's value in a mode. */
export interface ThemeValue {
  /** The variable it aliases (`neutral/50`), or the color itself (`#FFFFFF`). */
  alias: string;
  hex: string;
  /** The shade, when it's one. */
  stop: number | null;
  /** The palette role, or `auto`, `white`, `black`, `custom`. */
  role: string;
}

export interface ThemeToken {
  name: string;
  group: ThemeTokenSpec["group"];
  description: string;
  values: Partial<Record<ThemeMode, ThemeValue>>;
}

/** The Theme as the wizard would make it. */
export interface WizardTheme {
  modes: ThemeMode[];
  colors: WizardColor[];
  tokens: ThemeToken[];
}

/** A pair of tokens that must contrast, and the one a fix may move. */
export interface ContrastRule {
  label: string;
  fg: string;
  bg: string;
  min: number;
  fix: string;
}

export interface ContrastResult extends ContrastRule {
  mode: ThemeMode;
  fgHex: string;
  bgHex: string;
  ratio: number;
  pass: boolean;
}

/** Two roles that look alike, to everyone or with some deficiencies. */
export interface CvdWarning {
  a: string;
  b: string;
  aHex: string;
  bHex: string;
  everyone: boolean;
  kinds: CvdKind[];
}

/** A shade of a color: its step and color (`#RRGGBB`); `anchor` is the color itself (500). */
export interface WizardShade {
  stop: number;
  hex: string;
  anchor: boolean;
}
