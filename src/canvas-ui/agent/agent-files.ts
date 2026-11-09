import type { AgentFile } from "@canvas";

import type { AgentFiles } from "./agent-files.types";

/**
 * Holds, by tab id, the file of one product (a board, a design) whose editor is mounted, which
 * its editor sets (`useAgentFile`) and the app's agent tools read; plus which of them is on
 * screen.
 */
export function createAgentFiles<F extends AgentFile<unknown>>(): AgentFiles<F> {
  const files = new Map<string, F>();
  let activeTab: string | null = null;
  const listeners = new Set<() => void>();

  return {
    get: (tabId) => files.get(tabId) ?? null,
    set(tabId, file) {
      if (file) files.set(tabId, file);
      else files.delete(tabId);
      for (const listener of [...listeners]) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    active: () => (activeTab === null ? null : (files.get(activeTab) ?? null)),
    setActive(tabId, active) {
      if (active) activeTab = tabId;
      else if (activeTab === tabId) activeTab = null;
    },
  };
}
