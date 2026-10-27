import type { Locale } from "./i18n.types";
import { DEFAULT_LOCALE } from "./locales";

let current: Locale = DEFAULT_LOCALE;
let chosen = false;

/** Sets the app's locale. Called once, at boot (`app/i18n-boot.ts`), before any `t()`. */
export function setLocale(locale: Locale): void {
  current = locale;
  chosen = true;
}

/** The app's locale, e.g. for `Intl` formatters. */
export function getLocale(): Locale {
  return current;
}

/** Whether `setLocale` ran: a `t()` before it shows English. */
export function isLocaleSet(): boolean {
  return chosen;
}
