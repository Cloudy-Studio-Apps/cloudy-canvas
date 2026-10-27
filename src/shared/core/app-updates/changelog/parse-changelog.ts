// Imports carry `.ts`: `scripts/changelog/` runs this file with Node, which strips the types.
import type { Locale } from "../../i18n/i18n.types";
import { CHANGELOG_GROUP_KINDS, CHANGELOG_HEADINGS } from "./changelog-headings.ts";
import type {
  ChangelogEntry,
  ChangelogGroupKind,
  ChangelogItem,
  ChangelogProblem,
  ParsedChangelog,
} from "./changelog.types";

/** `## 0.5.0 - 2026-11-02` */
const RELEASED = /^## (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?) - (\d{4}-\d{2}-\d{2})$/;

/**
 * Reads a `CHANGELOG.md` written in `locale`: everything before the first `## ` is its title and
 * introduction; each `## ` is a version (or the unreleased changes), each `### ` a kind of change,
 * each `- ` one change (indented lines continue it).
 */
export function parseChangelog(text: string, locale: Locale): ParsedChangelog {
  const headings = CHANGELOG_HEADINGS[locale];
  const kindOf = new Map<string, ChangelogGroupKind>(
    CHANGELOG_GROUP_KINDS.map((kind) => [headings.groups[kind], kind]),
  );
  const entries: ChangelogEntry[] = [];
  const problems: ChangelogProblem[] = [];
  let groups: Map<ChangelogGroupKind, ChangelogItem[]> | null = null;
  let kind: ChangelogGroupKind | null = null;
  let last: ChangelogItem | null = null;

  const close = () => {
    const entry = entries.at(-1);
    if (!entry || !groups) return;
    entry.groups = CHANGELOG_GROUP_KINDS.flatMap((k) => {
      const items = groups?.get(k) ?? [];
      return items.length > 0 ? [{ kind: k, items }] : [];
    });
  };

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1;
    const content = raw.trim();
    if (content === "") return;

    if (raw.startsWith("## ")) {
      close();
      const released = RELEASED.exec(raw.trimEnd());
      if (released) {
        entries.push({ version: released[1] ?? null, date: released[2] ?? null, line, groups: [] });
      } else {
        if (raw.trimEnd() !== `## ${headings.unreleased}`) {
          problems.push({
            line,
            message: `"${content}" should be "## ${headings.unreleased}" or "## <version> - <YYYY-MM-DD>"`,
          });
        }
        entries.push({ version: null, date: null, line, groups: [] });
      }
      groups = new Map();
      kind = null;
      last = null;
      return;
    }
    // The title and introduction.
    if (!groups) return;

    if (raw.startsWith("### ")) {
      const heading = content.slice(4).trim();
      const found = kindOf.get(heading);
      last = null;
      if (!found) {
        const known = CHANGELOG_GROUP_KINDS.map((k) => headings.groups[k]).join(", ");
        problems.push({ line, message: `"### ${heading}" isn't one of: ${known}` });
        kind = null;
      } else if (groups.has(found)) {
        problems.push({ line, message: `"### ${heading}" is given twice in this version` });
        kind = found;
      } else {
        groups.set(found, []);
        kind = found;
      }
      return;
    }

    if (raw.startsWith("- ")) {
      if (!kind) {
        problems.push({ line, message: "a change outside a ### group" });
        return;
      }
      last = { text: content.slice(2).trim(), line };
      groups.get(kind)?.push(last);
      return;
    }

    if (last && /^\s/.test(raw)) {
      last.text = `${last.text} ${content}`;
      return;
    }
    problems.push({ line, message: `unexpected line "${content}" (changes are "- " lines)` });
  });
  close();

  return { entries, problems };
}
