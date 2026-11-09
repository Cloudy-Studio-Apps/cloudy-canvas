import type { FileTab } from "@canvas";
import type { OpenBoard } from "@board";
import { boardFiles } from "@board/ui";
import type { OpenDesign } from "@design";
import { designFiles } from "@design/ui";
import { fileTabs } from "../tabs/file-tabs-instance";
import type { AgentTabs } from "./agent-tab-binding.types";

/** The board or design of a tab whose editor is mounted, with the user's engine. */
export function tabAgentFile(tabId: string): OpenBoard | OpenDesign | null {
  return boardFiles.get(tabId) ?? designFiles.get(tabId);
}

/** Resolves once the tab's editor is mounted and its file ready; rejects after a timeout. */
export function waitForTabAgentFile(tab: FileTab): Promise<OpenBoard | OpenDesign> {
  return tab.type === "board" ? boardFiles.waitFor(tab.id) : designFiles.waitFor(tab.id);
}

/**
 * The file an agent's presence follows: its tab's, or while it's unbound the active tab's (where
 * its first call that needs a file binds it).
 */
export function presenceFileFor(tabs: AgentTabs, session: string): OpenBoard | OpenDesign | null {
  const tabId = tabs.tabFor(session) ?? fileTabs.store.get().activeId;
  return tabId === null ? null : tabAgentFile(tabId);
}

/**
 * Readies the session's tab before each of its calls: notes the call (the memory policy raises a
 * `document` or `hibernated` tab to `headless` and keeps it there while the agent calls) and waits
 * for its editor. Nothing for an unbound session, or one whose tab was closed (its next file call
 * says so).
 */
export async function prepareAgentCall(tabs: AgentTabs, session: string): Promise<void> {
  const tabId = tabs.tabFor(session);
  const tab = tabId === null ? undefined : fileTabs.get(tabId);
  if (!tab) return;
  fileTabs.noteAgentCall(tab.id);
  await waitForTabAgentFile(tab);
}
