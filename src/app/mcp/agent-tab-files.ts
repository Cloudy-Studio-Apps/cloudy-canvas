import type { FileType } from "@shared/core";
import type { FileTab } from "@canvas";
import type { OpenBoard } from "@board";
import { boardFiles } from "@board/ui";
import type { OpenDesign } from "@design";
import { designFiles } from "@design/ui";
import { fileTabs } from "../tabs/file-tabs-instance";
import type { AgentTabs } from "./agent-tab-binding.types";

/** What a session's next file call says once its tab was closed. */
export const TAB_CLOSED = "Your tab was closed: open, create or switch to a file.";

const OPEN_TIMEOUT_MS = 15_000;

/** The board or design of a tab whose editor is mounted, with the user's engine. */
export function tabAgentFile(tabId: string): OpenBoard | OpenDesign | null {
  return boardFiles.get(tabId) ?? designFiles.get(tabId);
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
 * The product a session's product tool runs on: its bound tab's type, else (unbound) the active
 * tab's, else `null` (Home). Bound to a tab closed since, it's unbound and this throws, once, as
 * its file calls do.
 */
export function agentProductFor(tabs: AgentTabs, session: string): FileType | null {
  const bound = tabs.tabFor(session);
  if (bound !== null) {
    const tab = fileTabs.get(bound);
    if (tab) return tab.type;
    tabs.unbind(session);
    throw new Error(TAB_CLOSED);
  }
  const { activeId } = fileTabs.store.get();
  return activeId === null ? null : (fileTabs.get(activeId)?.type ?? null);
}

/**
 * The product a session's tool list follows, as `agentProductFor` but read only: a bound session
 * whose tab was closed lists no product's tools (`null`) and stays bound, so its next file call
 * still says the tab closed.
 */
export function agentListProductFor(tabs: AgentTabs, session: string): FileType | null {
  const bound = tabs.tabFor(session);
  if (bound !== null) return fileTabs.get(bound)?.type ?? null;
  const { activeId } = fileTabs.store.get();
  return activeId === null ? null : (fileTabs.get(activeId)?.type ?? null);
}

/**
 * Readies the session's tab before each of its calls and returns how to end the call. A bound
 * session's call is begun on its tab first (`beginAgentCall`: the memory policy raises a
 * `document` or `hibernated` tab to `headless` and takes nothing away while it runs), then it waits
 * for the tab's editor; a tab whose file failed to load fails the call at once and unbinds the
 * session. An unbound session waits for the active tab's editor while it loads (where its first
 * file call binds it). Nothing for one whose tab was closed: its next file call says so.
 */
export async function prepareAgentCall(tabs: AgentTabs, session: string): Promise<() => void> {
  const tabId = tabs.tabFor(session);
  if (tabId === null) {
    const { activeId } = fileTabs.store.get();
    if (activeId !== null) await waitForTabEditor(activeId).catch(() => undefined);
    return () => undefined;
  }
  if (!fileTabs.get(tabId)) return () => undefined;
  fileTabs.beginAgentCall(tabId);
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    fileTabs.endAgentCall(tabId);
  };
  try {
    await waitForTabEditor(tabId);
  } catch (error) {
    end();
    if (fileTabs.get(tabId)?.load.status === "error") tabs.unbind(session);
    throw error;
  }
  return end;
}

/**
 * Resolves with the tab's file once its editor is mounted (`headless` or `active`, its file
 * registered); rejects when the tab closes, its file fails to load or after a timeout.
 */
export function waitForTabEditor(tabId: string): Promise<OpenBoard | OpenDesign> {
  return new Promise((resolve, reject) => {
    const stops: (() => void)[] = [];
    const done = () => {
      clearTimeout(timer);
      for (const stop of stops) stop();
    };
    const check = () => {
      const tab = fileTabs.get(tabId);
      if (!tab) return fail(new Error(TAB_CLOSED));
      if (tab.load.status === "error") {
        return fail(new Error(`${couldNotOpen(tab)}: ${tab.load.message}`));
      }
      const file = tab.state === "headless" || tab.state === "active" ? tabAgentFile(tabId) : null;
      if (!file) return;
      done();
      resolve(file);
    };
    const fail = (error: Error) => {
      done();
      reject(error);
    };
    const timer = setTimeout(() => {
      const tab = fileTabs.get(tabId);
      fail(new Error(tab ? `${couldNotOpen(tab)}.` : TAB_CLOSED));
    }, OPEN_TIMEOUT_MS);
    stops.push(
      fileTabs.store.subscribe(check),
      boardFiles.subscribe(check),
      designFiles.subscribe(check),
    );
    check();
  });
}

/** "The board "Sprint board" couldn't be opened", or "The new board …" before it has a name. */
function couldNotOpen(tab: FileTab): string {
  const what = tab.name ? `${tab.type} "${tab.name}"` : `new ${tab.type}`;
  return `The ${what} couldn't be opened`;
}
