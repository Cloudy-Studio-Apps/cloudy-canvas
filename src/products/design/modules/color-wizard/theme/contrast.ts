import { SHADE_STEPS } from "@canvas";

import { contrastRatio } from "../../variables";
import { onColor } from "../color";
import { buildTheme, themeColor } from "./build-theme";
import type {
  ContrastResult,
  ContrastRule,
  ThemeMode,
  ThemeOverrides,
  WizardColor,
  WizardOptions,
  WizardTheme,
} from "./theme.types";

/** The pairs a theme must keep readable (WCAG AA; 3:1 for large text and UI marks). */
export const CONTRAST_RULES: readonly ContrastRule[] = [
  { label: "Text on background", fg: "foreground", bg: "background", min: 4.5, fix: "foreground" },
  {
    label: "Muted text on surface",
    fg: "muted-foreground",
    bg: "surface",
    min: 4.5,
    fix: "muted-foreground",
  },
  { label: "Button label", fg: "primary-foreground", bg: "primary", min: 4.5, fix: "primary" },
  { label: "Link on surface", fg: "primary", bg: "surface", min: 3, fix: "primary" },
  { label: "Error text on surface", fg: "error", bg: "surface", min: 4.5, fix: "error" },
  { label: "Success on surface", fg: "success", bg: "surface", min: 3, fix: "success" },
  { label: "Warning on surface", fg: "warning", bg: "surface", min: 3, fix: "warning" },
];

/** Every rule whose two tokens exist, in every mode. */
export function contrastResults(theme: WizardTheme): ContrastResult[] {
  return theme.modes.flatMap((mode) =>
    CONTRAST_RULES.flatMap((rule) => {
      const fgHex = themeColor(theme, rule.fg, mode);
      const bgHex = themeColor(theme, rule.bg, mode);
      if (!fgHex || !bgHex) return [];
      const ratio = contrastRatio(fgHex, bgHex);
      return [{ ...rule, mode, fgHex, bgHex, ratio, pass: ratio >= rule.min }];
    }),
  );
}

/**
 * The choices with `name` moved, in `mode`, to the nearest shade of its color that passes every
 * rule that moves it; `null` when it isn't a shade or no shade passes.
 */
export function fixContrast(
  colors: readonly WizardColor[],
  options: WizardOptions,
  overrides: ThemeOverrides,
  name: string,
  mode: ThemeMode,
): ThemeOverrides | null {
  if (!options.shades) return null;
  const current = buildTheme(colors, options, overrides).tokens.find((t) => t.name === name)
    ?.values[mode];
  if (!current?.stop) return null;
  const steps = SHADE_STEPS["50-950"];
  const at = steps.indexOf(current.stop);
  const nearest = [...steps].sort(
    (a, b) => Math.abs(steps.indexOf(a) - at) - Math.abs(steps.indexOf(b) - at),
  );
  for (const stop of nearest) {
    const next: ThemeOverrides = {
      ...overrides,
      [name]: {
        ...overrides[name],
        [mode]: { ...overrides[name]?.[mode], role: current.role, stop },
      },
    };
    const passes = contrastResults(buildTheme(colors, options, next))
      .filter((r) => r.fix === name && r.mode === mode)
      .every((r) => r.pass);
    if (passes) return next;
  }
  return null;
}

/** Every failing pair fixed where a shade can; how many were. */
export function fixAllContrast(
  colors: readonly WizardColor[],
  options: WizardOptions,
  overrides: ThemeOverrides,
): { overrides: ThemeOverrides; fixed: number } {
  let next = overrides;
  let fixed = 0;
  for (const result of contrastResults(buildTheme(colors, options, overrides))) {
    if (result.pass) continue;
    const moved = fixContrast(colors, options, next, result.fix, result.mode);
    if (moved) {
      next = moved;
      fixed++;
    }
  }
  return { overrides: next, fixed };
}

/**
 * Whether `hex` as token `name` in `mode` would pass every rule it's in (a text on it follows
 * when that text is automatic); `null` when it's in none.
 */
export function candidatePasses(
  theme: WizardTheme,
  name: string,
  mode: ThemeMode,
  hex: string,
): boolean | null {
  const rules = CONTRAST_RULES.filter((r) => r.fg === name || r.bg === name);
  let checked = false;
  for (const rule of rules) {
    const otherName = rule.fg === name ? rule.bg : rule.fg;
    const other = theme.tokens.find((t) => t.name === otherName)?.values[mode];
    if (!other) continue;
    checked = true;
    const otherHex = other.role === "auto" ? onColor(hex) : other.hex;
    if (contrastRatio(hex, otherHex) < rule.min) return false;
  }
  return checked ? true : null;
}
