import type { Store } from "../../utils";

/** An agent asking the user to pick one of the variants it drew side by side. */
export interface VariantRequest {
  /** The agent's session (its presence key). */
  session: string;
  tabId: string;
  /** The page the variants are on, `null` without pages. */
  scope: string | null;
  ids: string[];
  /** One per id. */
  labels: string[];
  question: string | null;
}

/** What the user did with the chooser. */
export type VariantPick =
  | { choice: "one"; kept: string; label: string; removed: string[]; note?: string }
  | { choice: "all"; note?: string }
  | { choice: "dismissed" };

export interface VariantChoicesSnapshot {
  /** The pending request of each tab that has one. */
  readonly byTab: Readonly<Record<string, VariantRequest>>;
}

/**
 * The choices agents are waiting on, one per tab at most (see the README): an agent waits up to
 * `waitMs` for the pick, then is locked until the user picks or the chooser goes.
 */
export interface VariantChoices {
  readonly store: Store<VariantChoicesSnapshot>;
  /**
   * Shows the request and waits for the pick (`waitMs`, else the registry's); `null` when the
   * wait ended first (still pending).
   */
  open(request: VariantRequest, waitMs?: number): Promise<VariantPick | null>;
  pending(tabId: string): VariantRequest | null;
  /** The user's pick for the tab's request; nothing without one. */
  resolve(tabId: string, pick: VariantPick): void;
  /** Whether the session has a request waiting for the user. */
  isLocked(session: string): boolean;
  /** `"pending"` while locked, else the session's last pick, else `null`. */
  last(session: string): VariantPick | "pending" | null;
  /** The note about a pick made after the wait, once. */
  takeNote(session: string): string | null;
  /** The tab closed: its request is dismissed. */
  dropTab(tabId: string): void;
  /** The session ended: its request, note and pick are forgotten. */
  dropSession(session: string): void;
}

export interface VariantChoicesOptions {
  /** How long `open` waits for the pick; `VARIANT_WAIT_MS` by default. */
  waitMs?: number;
}
