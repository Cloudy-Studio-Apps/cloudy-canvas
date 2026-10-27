import type { ThemeFamily } from "./theme.types";

/** Lowercase, without accents ("Rosé" finds with "rose"). */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Whether a family matches a search: its name, its themes' labels and descriptions, or the name of
 * the plugin that added it. An empty search matches everything.
 */
export function matchThemeFamily(family: ThemeFamily, query: string, ownerName?: string): boolean {
  const needle = fold(query.trim());
  if (!needle) return true;
  const haystack = [family.label, ownerName, family.light, family.dark].flatMap((part) =>
    typeof part === "object" ? [part.label, part.description] : [part],
  );
  return haystack.some((text) => text !== undefined && fold(text).includes(needle));
}
