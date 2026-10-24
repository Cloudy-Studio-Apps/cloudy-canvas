import { create } from "zustand";

import type { AgentPresence, AgentPresenceState } from "./agent-presence-store.types";

/** An agent silent this long is shown idle (dimmed). */
export const AGENT_IDLE_MS = 20_000;
/** An agent silent this long is no longer shown as connected. */
export const AGENT_GONE_MS = 10 * 60_000;

/**
 * The agents (MCP sessions) talking to the app, what each one is doing and where its cursor is.
 * App UI state: it's never saved.
 */
export const useAgentPresenceStore = create<AgentPresenceState>()((set) => {
  const update = (key: string, patch: (agent: AgentPresence) => Partial<AgentPresence>) =>
    set((state) => {
      const agent = state.agents[key];
      if (!agent) return state;
      return { agents: { ...state.agents, [key]: { ...agent, ...patch(agent) } } };
    });

  return {
    agents: {},
    join: (identity) =>
      set((state) => {
        const now = Date.now();
        const current = state.agents[identity.key];
        const agent: AgentPresence = current
          ? { ...current, ...identity, lastSeen: now }
          : {
              ...identity,
              connectedAt: now,
              lastSeen: now,
              running: 0,
              activity: null,
              cursor: null,
            };
        return { agents: { ...state.agents, [identity.key]: agent } };
      }),
    seen: (key) => update(key, () => ({ lastSeen: Date.now() })),
    leave: (key) =>
      set((state) => {
        if (!state.agents[key]) return state;
        const agents = { ...state.agents };
        delete agents[key];
        return { agents };
      }),
    startCall: (key, tool, label) =>
      update(key, (agent) => {
        const now = Date.now();
        return {
          lastSeen: now,
          running: agent.running + 1,
          activity: { tool, label, startedAt: now, status: "running" },
        };
      }),
    finishCall: (key, { label, ok, error }) =>
      update(key, (agent) => ({
        lastSeen: Date.now(),
        running: Math.max(0, agent.running - 1),
        activity: agent.activity && {
          ...agent.activity,
          label,
          status: ok ? "done" : "error",
          ...(error === undefined ? {} : { error }),
        },
      })),
    moveCursor: (key, cursor) => update(key, () => ({ cursor })),
    prune: (now) =>
      set((state) => {
        const kept = Object.values(state.agents).filter(
          (agent) => agent.running > 0 || now - agent.lastSeen < AGENT_GONE_MS,
        );
        if (kept.length === Object.keys(state.agents).length) return state;
        return { agents: Object.fromEntries(kept.map((agent) => [agent.key, agent])) };
      }),
  };
});

/** The agent hasn't sent anything for a while and isn't running a call. */
export function agentIsIdle(agent: AgentPresence, now: number): boolean {
  return agent.running === 0 && now - agent.lastSeen >= AGENT_IDLE_MS;
}
