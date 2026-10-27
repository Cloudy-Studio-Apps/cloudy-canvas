// Prints a version's release notes from the changelogs: `node scripts/changelog/release-notes.mjs
// 0.5.0`. The release workflow makes them the GitHub release's description and the updater's
// notes. Exits 1 when a changelog has no changes for that version.
import { releaseNotesBody } from "../../src/shared/core/app-updates/changelog/release-notes.ts";
import { readChangelogs } from "./changelog-files.mjs";

const version = process.argv[2]?.replace(/^v/, "");
if (!version) fail("Usage: node scripts/changelog/release-notes.mjs <version>");

const byLocale = {};
for (const { locale, file, entries } of readChangelogs()) {
  const entry = entries.find((e) => e.version === version);
  if (!entry || entry.groups.length === 0) fail(`${file} lists no changes for ${version}.`);
  byLocale[locale] = entry.groups;
}

console.log(releaseNotesBody(byLocale));

function fail(message) {
  console.error(message);
  process.exit(1);
}
