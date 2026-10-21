import type { AgentBoard } from "@engine";

const OPEN_TIMEOUT_MS = 15_000;

let current: AgentBoard | null = null;
const listeners = new Set<() => void>();

/** The board open in the window, for agents (see `app/mcp`). */
export function getActiveBoard(): AgentBoard | null {
  return current;
}

export function setActiveBoard(board: AgentBoard | null): void {
  current = board;
  for (const listener of listeners) listener();
}

/** Resolves once board `id` is open and ready; rejects if it isn't within the timeout. */
export function waitForActiveBoard(id: string): Promise<AgentBoard> {
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
      reject(new Error(`The board ${id} couldn't be opened.`));
    }, OPEN_TIMEOUT_MS);
    listeners.add(check);
  });
}
