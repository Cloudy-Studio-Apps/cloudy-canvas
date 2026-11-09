import type { FileTab, TabState } from "./file-tabs.types";
import { TAB_LIMITS } from "./tab-limits";
import type { PolicyContext, PolicyInput, TabStatePlan } from "./tab-policy.types";

/** How much each state holds, to compare them. */
const LEVEL: Record<TabState, number> = { hibernated: 0, document: 1, headless: 2, active: 3 };

/** Whether an agent bound to the tab called it within `agentActiveMs`. */
export function agentCalling(tab: FileTab, now: number): boolean {
  return (
    tab.agents.length > 0 &&
    tab.lastAgentCallAt !== null &&
    now - tab.lastAgentCallAt < TAB_LIMITS.agentActiveMs
  );
}

/** The state the README's table gives the tab (first match wins). */
export function targetState(tab: FileTab, ctx: PolicyContext): TabState {
  if (tab.id === ctx.activeId) return "active";
  if (ctx.now - tab.lastActiveAt < TAB_LIMITS.leaveGraceMs) return "headless";
  if (agentCalling(tab, ctx.now)) return "headless";
  if (tab.agents.length > 0 || tab.live || tab.hosting || tab.unsaved) return "document";
  if (ctx.recentRank < TAB_LIMITS.recentTabs) return "document";
  if (ctx.now - tab.lastActiveAt < TAB_LIMITS.hibernateAfterMs) return "document";
  return "hibernated";
}

/**
 * The background tabs to move, and where: each goes down to its `targetState`, never up (a tab
 * opened in the background or restored stays hibernated until it's shown), except that a calling
 * agent brings its tab's engine back. Then at most `maxHeadless` keep an engine: past that, the
 * least recently shown drop to `document`, those an agent is calling last.
 */
export function planTabStates({ tabs, activeId, now, leaving }: PolicyInput): TabStatePlan {
  const ranks = new Map(
    [...tabs].sort((a, b) => b.lastActiveAt - a.lastActiveAt).map((tab, rank) => [tab.id, rank]),
  );
  const plan: TabStatePlan = new Map();
  const headless: FileTab[] = [];
  for (const tab of tabs) {
    if (tab.id === activeId || tab.state === "active" || leaving.has(tab.id)) continue;
    const target = targetState(tab, { activeId, now, recentRank: ranks.get(tab.id) ?? 0 });
    const raise = target === "headless" && agentCalling(tab, now);
    const next = raise || LEVEL[target] < LEVEL[tab.state] ? target : tab.state;
    if (next !== tab.state) plan.set(tab.id, next);
    if (next === "headless") headless.push(tab);
  }
  const over = headless.length - TAB_LIMITS.maxHeadless;
  if (over > 0) {
    const calling = (tab: FileTab) => (agentCalling(tab, now) ? 1 : 0);
    const demotable = headless.sort(
      (a, b) => calling(a) - calling(b) || a.lastActiveAt - b.lastActiveAt,
    );
    for (const tab of demotable.slice(0, over)) {
      if (tab.state === "headless") plan.set(tab.id, "document");
      else plan.delete(tab.id);
    }
  }
  return plan;
}

/** Whether the tab may lose its document: never with an agent, a live session or unsaved changes. */
export function mayHibernate(tab: FileTab): boolean {
  return tab.agents.length === 0 && !tab.live && !tab.hosting && !tab.unsaved;
}
