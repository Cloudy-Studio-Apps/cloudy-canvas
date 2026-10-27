// Imports carry `.ts`: `scripts/changelog/` runs this file with Node, which strips the types.
import type { Locale } from "../../i18n/i18n.types";
import { CHANGELOG_HEADINGS } from "./changelog-headings.ts";
import type { ChangelogGroup } from "./changelog.types";
import { parseChangelog } from "./parse-changelog.ts";

/** Starts the part of a release's notes in another language than English. */
const LANGUAGE_MARK = /^<!-- lang:(\w+) -->$/m;

/** The language names shown on the release page above each translation. */
const LANGUAGE_TITLES: Record<Exclude<Locale, "en">, string> = { es: "Español" };

/** One language's groups as Markdown: a `### ` heading per kind and its `- ` changes. */
export function formatChangelogGroups(groups: readonly ChangelogGroup[], locale: Locale): string {
  const headings = CHANGELOG_HEADINGS[locale].groups;
  return groups
    .map((group) => [`### ${headings[group.kind]}`, ...group.items.map((i) => `- ${i.text}`)])
    .map((lines) => lines.join("\n"))
    .join("\n\n");
}

/**
 * A release's description (and the updater's notes): the English changes, then each translation
 * after a `<!-- lang:xx -->` mark and a title.
 */
export function releaseNotesBody(byLocale: Record<Locale, readonly ChangelogGroup[]>): string {
  const translations = (Object.keys(LANGUAGE_TITLES) as Exclude<Locale, "en">[]).map((locale) =>
    [
      `<!-- lang:${locale} -->`,
      `## ${LANGUAGE_TITLES[locale]}`,
      formatChangelogGroups(byLocale[locale], locale),
    ].join("\n\n"),
  );
  return [formatChangelogGroups(byLocale.en, "en"), ...translations].join("\n\n");
}

/**
 * The changes in a release's notes, in `locale` when they're translated, else in English; empty
 * when the notes aren't written that way (an older release).
 */
export function parseReleaseNotes(body: string | null, locale: Locale): ChangelogGroup[] {
  if (!body) return [];
  const parts = new Map<string, string>();
  const pieces = body.split(LANGUAGE_MARK);
  parts.set("en", pieces[0] ?? "");
  for (let i = 1; i + 1 < pieces.length; i += 2) parts.set(pieces[i] ?? "", pieces[i + 1] ?? "");

  const language: Locale = parts.has(locale) ? locale : "en";
  const changes = (parts.get(language) ?? "")
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("## "))
    .join("\n");
  const unreleased = `## ${CHANGELOG_HEADINGS[language].unreleased}\n${changes}`;
  return parseChangelog(unreleased, language).entries[0]?.groups ?? [];
}
