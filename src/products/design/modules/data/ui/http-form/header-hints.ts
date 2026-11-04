import { t } from "../../data.i18n";
import type { PairSuggestion } from "./pair-row.types";
import type { HeaderHint } from "./header-hints.types";

/** The headers people usually need, offered while typing a header's name. */
export const HEADER_HINTS: readonly HeaderHint[] = [
  { name: "Accept", hint: "accept", values: ["application/json", "text/csv", "*/*"] },
  {
    name: "Content-Type",
    hint: "contentType",
    values: ["application/json", "application/x-www-form-urlencoded", "text/plain"],
  },
  { name: "Authorization", hint: "authorization", values: ["Bearer ", "Basic "], secret: true },
  { name: "X-API-Key", hint: "apiKey", values: [], secret: true },
  { name: "Accept-Language", hint: "acceptLanguage", values: ["en", "es", "en-US, es;q=0.8"] },
  { name: "Cache-Control", hint: "cacheControl", values: ["no-cache", "max-age=0"] },
  { name: "User-Agent", hint: "userAgent", values: ["CloudyCanvas/1.0"] },
  { name: "If-None-Match", hint: "ifNoneMatch", values: [] },
];

/** A name that reads like a secret: its value is kept on this device by default. */
const SECRET_NAME = /auth|key|token|secret|password|cookie/i;

export function headerHint(name: string): HeaderHint | undefined {
  const lower = name.trim().toLowerCase();
  return HEADER_HINTS.find((h) => h.name.toLowerCase() === lower);
}

/** What a header is for, in the app's language, when it's a known one. */
export function headerHintText(name: string): string | undefined {
  const hint = headerHint(name);
  return hint ? t(`connection.headerHints.${hint.hint}`) : undefined;
}

export function looksSecret(name: string): boolean {
  return headerHint(name)?.secret ?? SECRET_NAME.test(name);
}

/** The known headers whose names hold what's typed (not the one typed exactly). */
export function headerNameSuggestions(query: string): PairSuggestion[] {
  const q = query.trim().toLowerCase();
  return HEADER_HINTS.filter(
    (h) => h.name.toLowerCase().includes(q) && h.name.toLowerCase() !== q,
  ).map((h) => ({ value: h.name, hint: t(`connection.headerHints.${h.hint}`) }));
}

/** A known header's usual values that hold what's typed. */
export function headerValueSuggestions(name: string, query: string): PairSuggestion[] {
  const q = query.toLowerCase();
  return (headerHint(name)?.values ?? [])
    .filter((v) => v !== query && v.toLowerCase().includes(q))
    .map((value) => ({ value }));
}
