import { fileTabs } from "../tabs/file-tabs-instance";
import type { AgentTabs } from "./agent-tab-binding.types";
import { TAB_CLOSED, tabAgentFile } from "./agent-tab-files";

/**
 * The tab the session works in. Unbound, it binds to the active tab when that has a file (else
 * `null`: Home). Bound to a tab closed since, it's unbound and this throws, once.
 */
export function sessionTab(tabs: AgentTabs, session: string): string | null {
  const bound = tabs.tabFor(session);
  if (bound !== null) {
    if (fileTabs.get(bound)) return bound;
    tabs.unbind(session);
    throw new Error(TAB_CLOSED);
  }
  const { activeId } = fileTabs.store.get();
  if (activeId === null || !tabAgentFile(activeId)) return null;
  tabs.bind(session, activeId);
  fileTabs.noteAgentCall(activeId);
  return activeId;
}
