import type { RegisteredTheme, ThemeFamily } from "./theme.types";

/**
 * The themes as families, in registry order: a light and a dark theme with the same owner and
 * `family` share one; a theme without a family, or one whose appearance its family already has,
 * is its own.
 */
export function groupThemeFamilies(themes: readonly RegisteredTheme[]): ThemeFamily[] {
  const families = new Map<string, ThemeFamily>();
  for (const { theme, owner } of themes) {
    const familyKey = `${owner}:${theme.family ?? theme.id}`;
    const existing = families.get(familyKey);
    const key = existing?.[theme.appearance] ? `${owner}:${theme.id}` : familyKey;
    const family = families.get(key) ?? { key, label: theme.label, owner };
    family[theme.appearance] = theme;
    if (family.light && family.dark) family.label = theme.family ?? theme.label;
    families.set(key, family);
  }
  return [...families.values()];
}
