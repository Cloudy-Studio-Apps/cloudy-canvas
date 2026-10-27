// Translations: per-folder typed translators over `locales/*.json`, the app's locale (set once at
// boot) and the generic words every folder shares.
export type * from "./i18n.types";
export { tCommon } from "./common/common.i18n";
export { getLocale, setLocale } from "./current-locale";
export { defineMessages } from "./define-messages";
export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_NAMES,
  matchLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "./locales";
