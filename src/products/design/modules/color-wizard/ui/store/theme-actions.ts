import { SHADE_STEPS } from "@canvas";

import {
  buildTheme,
  fixAllContrast,
  fixContrast,
  wizardColors,
  type ThemeChoice,
  type ThemeMode,
  type ThemeOverrides,
  type ThemeValue,
} from "../..";
import { useColorWizardStore } from "./color-wizard-store";
import { wizardInput } from "./wizard-input";

const state = () => useColorWizardStore.getState();
const colorsNow = () => {
  const input = wizardInput(state());
  return { colors: wizardColors(input.roles, input.options), options: input.options };
};

/** A token's value in a mode as things stand. */
export function themeValue(
  name: string,
  mode: ThemeMode,
  overrides = state().overrides,
): ThemeValue | undefined {
  const { colors, options } = colorsNow();
  return buildTheme(colors, options, overrides).tokens.find((t) => t.name === name)?.values[mode];
}

/** What a token would be with no choice made (its "Automatic"). */
export function defaultThemeValue(name: string, mode: ThemeMode): ThemeValue | undefined {
  const { overrides } = state();
  const own = { ...overrides[name] };
  delete own[mode];
  return themeValue(name, mode, { ...overrides, [name]: own });
}

export function setThemeChoice(name: string, mode: ThemeMode, choice: ThemeChoice): void {
  const { overrides, set } = state();
  set({ overrides: { ...overrides, [name]: { ...overrides[name], [mode]: choice } } });
}

/** Back to the default. */
export function clearThemeChoice(name: string, mode: ThemeMode): void {
  const { overrides, set } = state();
  const own = { ...overrides[name] };
  delete own[mode];
  const next: ThemeOverrides = { ...overrides, [name]: own };
  if (!Object.keys(own).length) delete next[name];
  set({ overrides: next });
}

/** The same choice in the other mode, the shade mirrored (100 ↔ 900). */
export function mirrorThemeChoice(name: string, from: ThemeMode, to: ThemeMode): void {
  const value = themeValue(name, from);
  if (!value) return;
  const steps = SHADE_STEPS["50-950"];
  if (value.role === "custom") setThemeChoice(name, to, { role: "custom", hex: value.hex });
  else if (value.stop !== null) {
    const stop = steps[steps.length - 1 - steps.indexOf(value.stop)];
    setThemeChoice(name, to, { role: value.role, stop });
  } else setThemeChoice(name, to, { role: value.role });
}

/** The token moved to the nearest shade that passes its checks; whether one did. */
export function fixToken(name: string, mode: ThemeMode): boolean {
  const { colors, options } = colorsNow();
  const next = fixContrast(colors, options, state().overrides, name, mode);
  if (next) state().set({ overrides: next });
  return next !== null;
}

/** Every failing pair moved where a shade can; how many were. */
export function fixAllTokens(): number {
  const { colors, options } = colorsNow();
  const { overrides, fixed } = fixAllContrast(colors, options, state().overrides);
  state().set({ overrides });
  return fixed;
}
