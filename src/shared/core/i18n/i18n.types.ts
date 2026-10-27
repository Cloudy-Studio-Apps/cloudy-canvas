/** A language the app is translated into; `en` is the source and the fallback. */
export type Locale = "en" | "es";

/** The user's choice in Settings › Language: `system` follows the OS. */
export type LocalePreference = "system" | Locale;

/** A `locales/<lang>.json`: strings, grouped in nested objects. */
export interface MessageTree {
  readonly [key: string]: string | MessageTree;
}

/** The `Intl.PluralRules` categories a `<key>_<category>` string can be for. */
export type PluralCategory = Intl.LDMLPluralRule;

/** A leaf's own key, plus its base when it's a plural form (`items_one` also gives `items`). */
type LeafKey<K extends string> = K extends `${infer Base}_${PluralCategory}` ? Base | K : K;

/** Every dot path to a string in `T` (`"title"`, `"panel.add.active"`); never a group. */
export type MessageKey<T> = {
  [K in keyof T & string]: T[K] extends string ? LeafKey<K> : `${K}.${MessageKey<T[K]>}`;
}[keyof T & string];

/** The values for a string's `{name}` placeholders; a number `count` also picks the plural. */
export type MessageParams = Readonly<Record<string, string | number>>;

/** A folder's `t`: the string for a key, in the current locale. */
export type Translator<T> = (key: MessageKey<T>, params?: MessageParams) => string;

/** A translation: the same groups and keys as the English file, any of them left out. */
export type DeepPartial<T> = {
  readonly [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]>;
};

/** What `defineMessages` takes: the English strings and each translation. */
export type LocaleMessages<T> = { readonly en: T } & {
  readonly [L in Exclude<Locale, "en">]?: DeepPartial<NoInfer<T>>;
};
