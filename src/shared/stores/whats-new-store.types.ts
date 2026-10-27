import type { ChangelogGroup } from "@shared/core";

/** What the "What's new" dialog shows: a coming version's notes, or every version so far. */
export type WhatsNewContent =
  { kind: "update"; version: string; groups: readonly ChangelogGroup[] } | { kind: "history" };

export interface WhatsNewState {
  /** `null` while the dialog is closed. */
  content: WhatsNewContent | null;
  show: (content: WhatsNewContent) => void;
  close: () => void;
}
