import type { AgentFile } from "@canvas";

/**
 * The files of one product whose editors are mounted, by tab id, for agents (see
 * `createAgentFiles`).
 */
export interface AgentFiles<F extends AgentFile<unknown>> {
  /** The tab's file, while its editor is mounted (active or headless). */
  get(tabId: string): F | null;
  set(tabId: string, file: F | null): void;
  /** Calls `listener` whenever a tab's file is set or removed; returns how to stop. */
  subscribe(listener: () => void): () => void;
  /** The file of the tab on screen, or `null` (Home, or a tab of another product). */
  active(): F | null;
  /** Marks whether the tab is the one on screen. */
  setActive(tabId: string, active: boolean): void;
}
