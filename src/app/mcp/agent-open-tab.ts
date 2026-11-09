import type { TabSource } from "@canvas";
import { fileTabs } from "../tabs/file-tabs-instance";
import type { AgentTabs } from "./agent-tab-binding.types";
import { prepareAgentCall } from "./agent-tab-files";

/**
 * Opens the file in a background tab (never shown; an already open tab is reused), moves the
 * session there (leave + join) and waits for its editor; resolves with the tab's id.
 */
export async function openInAgentTab(
  tabs: AgentTabs,
  session: string,
  source: TabSource,
): Promise<string> {
  const tab = fileTabs.open(source, { activate: false });
  return bindAgentToTab(tabs, session, tab.id);
}

/** Moves the session to an open tab and waits for its editor. */
export async function bindAgentToTab(
  tabs: AgentTabs,
  session: string,
  tabId: string,
): Promise<string> {
  tabs.bind(session, tabId);
  const end = await prepareAgentCall(tabs, session);
  end();
  return tabId;
}
