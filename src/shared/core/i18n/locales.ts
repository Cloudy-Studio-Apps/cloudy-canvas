import type { Locale } from "./i18n.types";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "es"];

export const DEFAULT_LOCALE: Locale = "en";

/** Each language's name in itself, for the language picker. */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = { en: "English", es: "Español" };

export function isLocale(value: unknown): value is Locale {
  return (SUPPORTED_LOCALES as readonly unknown[]).includes(value);
}

/**
 * The first supported language among BCP 47 tags in preference order (`navigator.languages`):
 * `es-419`, `es_PE` and `ES` are all Spanish. English when none is supported.
 */
export function matchLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const language = tag.toLowerCase().split(/[-_]/)[0];
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}

/** The locale to show: the user's choice, or the OS's when it's `system` (or unknown). */
export function resolveLocale(preference: string | undefined, tags: readonly string[]): Locale {
  return isLocale(preference) ? preference : matchLocale(tags);
}
