import type { FileTabs } from "@canvas";

/**
 * Which tab each agent session works in (see the README): in memory only, so after a restart
 * every session binds again.
 */
export interface AgentTabs {
  /** The tab the session is bound to (it may have been closed since), or `null`. */
  tabFor(session: string): string | null;
  /** Binds the session to the tab, leaving the file it was in first (leave + join). */
  bind(session: string, tabId: string): void;
  unbind(session: string): void;
}

export interface AgentTabsOptions {
  tabs: FileTabs;
  /**
   * The session leaves the file it's in now (the bound tab's, or the active one's while unbound):
   * its workspace there ends and its presence goes.
   */
  leave(session: string): void;
}
