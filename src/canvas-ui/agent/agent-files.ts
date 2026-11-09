import type { AgentFile } from "@canvas";

import type { AgentFiles } from "./agent-files.types";

const OPEN_TIMEOUT_MS = 15_000;

/**
 * Holds, by tab id, the file of one product (a board, a design) whose editor is mounted, which
 * its editor sets (`useAgentFile`) and the app's agent tools read; plus which of them is on
 * screen. `noun` names it in errors.
 */
export function createAgentFiles<F extends AgentFile<unknown>>(noun: string): AgentFiles<F> {
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
    active: () => (activeTab === null ? null : (files.get(activeTab) ?? null)),
    setActive(tabId, active) {
      if (active) activeTab = tabId;
      else if (activeTab === tabId) activeTab = null;
    },
    waitFor(tabId) {
      const ready = files.get(tabId);
      if (ready) return Promise.resolve(ready);
      return new Promise((resolve, reject) => {
        const done = () => {
          clearTimeout(timer);
          listeners.delete(check);
        };
        const check = () => {
          const file = files.get(tabId);
          if (!file) return;
          done();
          resolve(file);
        };
        const timer = setTimeout(() => {
          done();
          reject(new Error(`The ${noun} ${tabId} couldn't be opened.`));
        }, OPEN_TIMEOUT_MS);
        listeners.add(check);
      });
    },
  };
}
