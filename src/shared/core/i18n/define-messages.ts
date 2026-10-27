import { getLocale, isLocaleSet } from "./current-locale";
import { flattenMessages } from "./flatten-messages";
import { formatMessage } from "./format-message";
import type { Locale, LocaleMessages, MessageParams, MessageTree, Translator } from "./i18n.types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";

const pluralRules = new Map<Locale, Intl.PluralRules>();
const warned = new Set<string>();

function warnOnce(message: string): void {
  if (!import.meta.env.DEV || warned.has(message)) return;
  warned.add(message);
  console.warn(`[i18n] ${message}`);
}

function pluralCategory(locale: Locale, count: number): string {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

/** The string for `key` in one locale's table: its plural form for a number `count` first. */
function lookup(
  table: Map<string, string> | undefined,
  locale: Locale,
  key: string,
  params: MessageParams | undefined,
): string | undefined {
  if (!table) return undefined;
  const count = params?.count;
  if (typeof count === "number") {
    const plural =
      table.get(`${key}_${pluralCategory(locale, count)}`) ?? table.get(`${key}_other`);
    if (plural !== undefined) return plural;
  }
  return table.get(key);
}

/**
 * A folder's translator, from its `locales/*.json` (`export const t = defineMessages({ en, es })`).
 * Keys are typed from the English file. A string missing in the current locale falls back to
 * English; a key missing from both shows `⟦key⟧` in dev (and warns once), the plain key in
 * production.
 */
export function defineMessages<T extends MessageTree>(messages: LocaleMessages<T>): Translator<T> {
  const tables = new Map<Locale, Map<string, string>>();
  for (const locale of SUPPORTED_LOCALES) {
    const tree = messages[locale];
    if (tree) tables.set(locale, flattenMessages(tree));
  }

  return (key, params) => {
    if (!isLocaleSet()) warnOnce("t() was called before the locale was set; it shows English.");
    const locale = getLocale();
    const template =
      lookup(tables.get(locale), locale, key, params) ??
      lookup(tables.get(DEFAULT_LOCALE), DEFAULT_LOCALE, key, params);
    if (template === undefined) {
      warnOnce(`Missing message "${key}".`);
      return import.meta.env.DEV ? `⟦${key}⟧` : key;
    }
    return formatMessage(template, params);
  };
}
