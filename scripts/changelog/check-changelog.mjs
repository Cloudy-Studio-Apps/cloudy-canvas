// Checks CHANGELOG.md and its Spanish translation CHANGELOG.es.md; part of `pnpm lint`
// (`pnpm check:changelog` alone). Prints one line per problem and exits 1, or prints nothing.
//
//   format       a line the parser can't place (src/shared/core/app-updates/changelog/)
//   unreleased   the unreleased section is missing, given twice or not first
//   empty        a released version without changes
//   emoji        a change with an emoji
//   versions     the two files don't list the same versions in the same order
//   entries      a version's group has a different number of changes in the translation
import { CHANGELOG_GROUP_KINDS } from "../../src/shared/core/app-updates/changelog/changelog-headings.ts";
import { readChangelogs } from "./changelog-files.mjs";

const EMOJI = /\p{Extended_Pictographic}/u;

const problems = [];
const report = (file, line, rule, message) => problems.push(`${file}:${line}  ${rule}: ${message}`);

const changelogs = readChangelogs();

for (const { file, entries, problems: found } of changelogs) {
  for (const { line, message } of found) report(file, line, "format", message);

  const unreleased = entries.filter((entry) => entry.version === null);
  if (unreleased.length === 0) report(file, 1, "unreleased", "no unreleased section");
  for (const entry of unreleased.slice(1)) report(file, entry.line, "unreleased", "given twice");
  if (unreleased.length > 0 && entries[0]?.version !== null) {
    report(file, unreleased[0].line, "unreleased", "must come before every version");
  }

  for (const entry of entries) {
    if (entry.version !== null && entry.groups.length === 0) {
      report(file, entry.line, "empty", `${entry.version} lists no changes`);
    }
    for (const item of entry.groups.flatMap((group) => group.items)) {
      if (EMOJI.test(item.text))
        report(file, item.line, "emoji", "changes are written without emojis");
    }
  }
}

const [source, ...translations] = changelogs;
const label = (entry) => entry?.version ?? "unreleased";
const count = (entry, kind) => entry.groups.find((group) => group.kind === kind)?.items.length ?? 0;

for (const translation of translations) {
  const length = Math.max(source.entries.length, translation.entries.length);
  for (let i = 0; i < length; i++) {
    const original = source.entries[i];
    const translated = translation.entries[i];
    if (!original || !translated || original.version !== translated.version) {
      report(
        translation.file,
        translated?.line ?? 1,
        "versions",
        `found ${translated ? label(translated) : "nothing"} where ${source.file} has ${original ? label(original) : "nothing"}`,
      );
      continue;
    }
    for (const kind of CHANGELOG_GROUP_KINDS) {
      const expected = count(original, kind);
      const actual = count(translated, kind);
      if (expected !== actual) {
        report(
          translation.file,
          translated.line,
          "entries",
          `${label(translated)} has ${actual} "${kind}" change(s), ${source.file} has ${expected}`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(
    `\n${problems.length} changelog problem(s). See src/shared/core/app-updates/README.md.`,
  );
  process.exit(1);
}
