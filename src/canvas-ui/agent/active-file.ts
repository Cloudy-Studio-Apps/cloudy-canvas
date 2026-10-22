import type { AgentFile } from "@canvas";

import type { ActiveFile } from "./active-file.types";

const OPEN_TIMEOUT_MS = 15_000;

/**
 * Holds the file of one product open in the window (a board, a design), which its editor sets
 * (`useAgentFile`) and the app's agent tools read. `noun` names it in errors.
 */
export function createActiveFile<F extends AgentFile<unknown>>(noun: string): ActiveFile<F> {
  let current: F | null = null;
  const listeners = new Set<() => void>();

  return {
    get: () => current,
    set(file) {
      current = file;
      for (const listener of listeners) listener();
    },
    waitFor(id) {
      if (current?.id === id) return Promise.resolve(current);
      return new Promise((resolve, reject) => {
        const done = () => {
          clearTimeout(timer);
          listeners.delete(check);
        };
        const check = () => {
          if (current?.id !== id) return;
          done();
          resolve(current);
        };
        const timer = setTimeout(() => {
          done();
          reject(new Error(`The ${noun} ${id} couldn't be opened.`));
        }, OPEN_TIMEOUT_MS);
        listeners.add(check);
      });
    },
  };
}
