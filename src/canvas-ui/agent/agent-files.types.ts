import type { AgentFile } from "@canvas";

/**
 * The files of one product whose editors are mounted, by tab id, for agents (see
 * `createAgentFiles`).
 */
export interface AgentFiles<F extends AgentFile<unknown>> {
  /** The tab's file, while its editor is mounted (active or headless). */
  get(tabId: string): F | null;
  set(tabId: string, file: F | null): void;
  /** Resolves once the tab's editor is mounted and its file ready; rejects after a timeout. */
  waitFor(tabId: string): Promise<F>;
  /** The file of the tab on screen, or `null` (Home, or a tab of another product). */
  active(): F | null;
  /** Marks whether the tab is the one on screen. */
  setActive(tabId: string, active: boolean): void;
}
