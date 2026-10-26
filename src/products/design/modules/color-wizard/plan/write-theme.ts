import { DEFAULT_VALUE, type DocumentTokens, type TokenValue } from "@canvas";

import { CONTRAST_RULES, type ThemeMode, type ThemeValue, type WizardTheme } from "../theme";
import { collectionNamed } from "./collection-named";
import { THEME_AXIS, THEME_COLLECTION } from "./constants";

/** Each mode's id on the Theme axis (made, and given the missing modes, when there are two). */
function modeIds(tokens: DocumentTokens, modes: readonly ThemeMode[]): Map<ThemeMode, string> {
  const ids = new Map<ThemeMode, string>();
  if (modes.length < 2) {
    modes.forEach((m) => ids.set(m, DEFAULT_VALUE));
    return ids;
  }
  const axis =
    tokens
      .store()
      .axes()
      .find((a) => a.name === THEME_AXIS) ?? tokens.createAxis(THEME_AXIS, modes);
  for (const mode of modes) {
    const found = axis.modes.find((m) => m.name === mode) ?? tokens.addMode(axis.id, mode);
    // The axis's first mode is its base: its value is the variable's default.
    ids.set(mode, found.id === axis.modes[0]?.id ? DEFAULT_VALUE : found.id);
  }
  return ids;
}

/**
 * Writes the Theme collection: a variable per token, an alias of its shade (or the color itself
 * for white, black, custom and automatic ones) in each mode, varying by the Theme axis when it
 * has two; contrast pairs are declared so the variables' contrast checks know them.
 */
export function writeTheme(
  tokens: DocumentTokens,
  theme: WizardTheme,
  palette: ReadonlyMap<string, string>,
): void {
  const { id: collectionId } = collectionNamed(tokens, THEME_COLLECTION);
  const modes = modeIds(tokens, theme.modes);
  const axisId =
    theme.modes.length > 1
      ? tokens
          .store()
          .axes()
          .find((a) => a.name === THEME_AXIS)?.id
      : undefined;
  const valueOf = (v: ThemeValue): TokenValue => {
    const alias = palette.get(v.alias);
    return alias ? { alias } : { color: `${v.hex}FF` };
  };
  const ids = new Map<string, string>();
  for (const token of theme.tokens) {
    const first = token.values[theme.modes[0]!]!;
    const known = tokens.store().byPath(collectionId, token.name);
    const id =
      known?.id ??
      tokens.createVariable({
        collectionId,
        name: token.name,
        type: "color",
        value: valueOf(first),
      }).id;
    if (axisId) tokens.setVariableAxis(id, axisId);
    for (const mode of theme.modes) {
      const value = token.values[mode];
      if (value) tokens.setValue(id, modes.get(mode) ?? DEFAULT_VALUE, valueOf(value));
    }
    ids.set(token.name, id);
  }
  for (const rule of CONTRAST_RULES) {
    const fg = ids.get(rule.fg);
    const bg = ids.get(rule.bg);
    if (!fg || !bg) continue;
    const partners = tokens.store().variable(fg)?.contrastWith ?? [];
    tokens.updateVariable(fg, { contrastWith: [...partners, bg] });
  }
}
