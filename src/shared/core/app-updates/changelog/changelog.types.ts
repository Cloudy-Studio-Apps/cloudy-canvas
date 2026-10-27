/** The kinds of change a changelog lists, in the order they're shown. */
export type ChangelogGroupKind = "new" | "improved" | "fixed";

/** One `- ` line of a changelog, with the line it starts on. */
export interface ChangelogItem {
  text: string;
  line: number;
}

/** The items under one `### ` heading. */
export interface ChangelogGroup {
  kind: ChangelogGroupKind;
  items: ChangelogItem[];
}

/** One `## ` section: a released version, or the changes not released yet (`version: null`). */
export interface ChangelogEntry {
  version: string | null;
  /** When it was released (`YYYY-MM-DD`); `null` while unreleased. */
  date: string | null;
  line: number;
  /** In the order of `CHANGELOG_GROUP_KINDS`; groups without items are left out. */
  groups: ChangelogGroup[];
}

/** Something a changelog breaks: an unknown heading, a stray line, a heading given twice. */
export interface ChangelogProblem {
  line: number;
  message: string;
}

export interface ParsedChangelog {
  /** Newest first, as written. */
  entries: ChangelogEntry[];
  problems: ChangelogProblem[];
}

/** The headings a changelog in one language is written with. */
export interface ChangelogHeadings {
  unreleased: string;
  groups: Record<ChangelogGroupKind, string>;
}
