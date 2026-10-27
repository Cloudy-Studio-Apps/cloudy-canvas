// The changelog files, read with the app's own parser (`src/shared/core/app-updates/changelog/`,
// run by Node with its types stripped).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { parseChangelog } from "../../src/shared/core/app-updates/changelog/parse-changelog.ts";

export const ROOT = join(dirname(new URL(import.meta.url).pathname), "..", "..");

/** One file per language; English is the source. */
export const CHANGELOG_FILES = { en: "CHANGELOG.md", es: "CHANGELOG.es.md" };

/** `{ locale, file, text, entries, problems }` for each language. */
export function readChangelogs() {
  return Object.entries(CHANGELOG_FILES).map(([locale, file]) => {
    const text = readFileSync(join(ROOT, file), "utf8");
    return { locale, file, text, ...parseChangelog(text, locale) };
  });
}
