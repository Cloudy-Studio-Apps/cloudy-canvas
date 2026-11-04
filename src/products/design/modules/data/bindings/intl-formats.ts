/**
 * Intl formatters by locale and options, made once: building one is far slower than formatting,
 * and a sync formats every bound value. A constructor that throws (an unknown currency) caches
 * nothing and throws to the caller.
 */
const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function cached<F>(cache: Map<string, F>, key: string, make: () => F): F {
  const known = cache.get(key);
  if (known) return known;
  const made = make();
  cache.set(key, made);
  return made;
}

export function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  return cached(numberFormats, key, () => new Intl.NumberFormat(locale, options));
}

export function dateFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  return cached(dateFormats, key, () => new Intl.DateTimeFormat(locale, options));
}
