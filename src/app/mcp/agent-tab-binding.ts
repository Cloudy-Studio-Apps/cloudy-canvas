import type { AgentTabs, AgentTabsOptions } from "./agent-tab-binding.types";

/**
 * Binds agent sessions to file tabs, like a collaborator who joined one file. The binding is
 * mirrored on the tab (`FileTabs.bindAgent`), so the memory policy keeps it from hibernating.
 */
export function createAgentTabs({ tabs, leave }: AgentTabsOptions): AgentTabs {
  const bound = new Map<string, string>();

  return {
    tabFor: (session) => bound.get(session) ?? null,
    bind(session, tabId) {
      // An unbound session's calls are watched on the active tab's file (see the presence source).
      const current = bound.get(session) ?? tabs.store.get().activeId;
      if (current !== null && current !== tabId) leave(session);
      bound.set(session, tabId);
      tabs.bindAgent(tabId, session);
    },
    unbind(session) {
      bound.delete(session);
      tabs.unbindAgent(session);
    },
  };
}
