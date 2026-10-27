import { getLocale, parseChangelog } from "@shared/core";
import type { ChangelogEntry, Locale } from "@shared/core";
import en from "../../../CHANGELOG.md?raw";
import es from "../../../CHANGELOG.es.md?raw";

const TEXT: Record<Locale, string> = { en, es };

let entries: ChangelogEntry[] | null = null;

/**
 * The changelog the app was built with, in the app's language: the released versions, newest
 * first (plus the unreleased changes in development builds).
 */
export function bundledChangelog(): readonly ChangelogEntry[] {
  entries ??= parseChangelog(TEXT[getLocale()], getLocale()).entries.filter(
    (entry) => entry.groups.length > 0 && (entry.version !== null || import.meta.env.DEV),
  );
  return entries;
}

/** A released version's changes, if the bundled changelog lists any. */
export function bundledChangesOf(version: string): ChangelogEntry | null {
  return bundledChangelog().find((entry) => entry.version === version) ?? null;
}
