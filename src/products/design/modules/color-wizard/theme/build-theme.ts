import { onColor } from "../color";
import { shadeOf } from "./shades";
import { MODE_SETS, SPECIAL_COLORS, THEME_SPEC } from "./theme-spec";
import type {
  ThemeMode,
  ThemeOverrides,
  ThemeTokenSpec,
  ThemeToken,
  ThemeValue,
  WizardColor,
  WizardOptions,
  WizardTheme,
} from "./theme.types";

/** The palette color a role names (the first that exists of a list). */
function findRole(colors: readonly WizardColor[], role: string | readonly string[]) {
  return [role]
    .flat()
    .map((r) => colors.find((c) => c.name === r))
    .find(Boolean);
}

function valueOf(
  spec: ThemeTokenSpec,
  mode: ThemeMode,
  colors: readonly WizardColor[],
  options: WizardOptions,
  overrides: ThemeOverrides,
  made: readonly ThemeToken[],
): ThemeValue | null {
  const choice = overrides[spec.name]?.[mode] ?? {};
  const role = choice.role ?? spec.role;
  const stop = choice.stop ?? spec[mode];
  if (role === "auto") {
    const base = made.find((t) => t.name === spec.on)?.values[mode];
    if (!base) return null;
    const hex = onColor(base.hex);
    return { alias: hex, hex, stop: null, role: "auto" };
  }
  if (role === "custom" && choice.hex) {
    return { alias: choice.hex, hex: choice.hex, stop: null, role: "custom" };
  }
  const special = typeof role === "string" ? SPECIAL_COLORS[role] : undefined;
  if (special || stop === "white") {
    const key = special ? (role as string) : "white";
    return { alias: SPECIAL_COLORS[key]!, hex: SPECIAL_COLORS[key]!, stop: null, role: key };
  }
  const fallback = findRole(colors, "primary") ?? colors[0];
  const src = findRole(colors, role) ?? (spec.core ? fallback : undefined);
  if (!src) return null;
  if (!options.shades || typeof stop !== "number") {
    return { alias: src.name, hex: src.hex, stop: null, role: src.name };
  }
  return { alias: `${src.name}/${stop}`, hex: shadeOf(src.hex, stop), stop, role: src.name };
}

/**
 * The Theme the wizard would make: each token's value per mode (the defaults, or the user's
 * choices), leaving out tokens whose role is missing (no status colors, no accent).
 */
export function buildTheme(
  colors: readonly WizardColor[],
  options: WizardOptions,
  overrides: ThemeOverrides,
): WizardTheme {
  const modes = [...MODE_SETS[options.modes]];
  const tokens: ThemeToken[] = [];
  if (!colors.length) return { modes, colors: [...colors], tokens };
  for (const spec of THEME_SPEC) {
    const values: ThemeToken["values"] = {};
    for (const mode of modes) {
      const value = valueOf(spec, mode, colors, options, overrides, tokens);
      if (value) values[mode] = value;
    }
    if (modes.every((m) => values[m])) {
      tokens.push({ name: spec.name, group: spec.group, description: spec.description, values });
    }
  }
  return { modes, colors: [...colors], tokens };
}

/** A token's color in a mode, if it has one. */
export function themeColor(theme: WizardTheme, name: string, mode: ThemeMode): string | undefined {
  return theme.tokens.find((t) => t.name === name)?.values[mode]?.hex;
}
