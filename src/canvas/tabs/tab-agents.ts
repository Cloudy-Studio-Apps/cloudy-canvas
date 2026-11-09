import type { FileTab } from "./file-tabs.types";
import { patchTab } from "./tab-list";

/**
 * The agent bookkeeping of a `FileTabs`, as changes to its tab list: which sessions are bound to
 * which tab, and the calls in progress in each.
 */

/** `tabs` with the agent session bound to the tab `id`, moved out of the tab it was in. */
export function bindAgentTo(
  tabs: readonly FileTab[],
  id: string,
  session: string,
): readonly FileTab[] {
  if (!tabs.some((tab) => tab.id === id)) return tabs;
  return patchTab(unbindAgentFrom(tabs, session), id, (tab) => ({
    agents: [...tab.agents, session],
  }));
}

/** `tabs` with the agent session bound to no tab. */
export function unbindAgentFrom(tabs: readonly FileTab[], session: string): readonly FileTab[] {
  const tab = tabs.find((other) => other.agents.includes(session));
  if (!tab) return tabs;
  const agents = tab.agents.filter((other) => other !== session);
  return patchTab(tabs, tab.id, () => ({ agents }));
}

/**
 * `tabs` with an agent call started (`delta` 1) or ended (-1) in the tab `id` at `now`; with 0,
 * only the call's time is noted.
 */
export function countAgentCall(
  tabs: readonly FileTab[],
  id: string,
  delta: -1 | 0 | 1,
  now: number,
): readonly FileTab[] {
  return patchTab(tabs, id, (tab) => ({
    agentCalls: Math.max(0, tab.agentCalls + delta),
    lastAgentCallAt: now,
  }));
}
