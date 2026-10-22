import type { AgentFile } from "@canvas";

/** The file of one product open in the window, for agents (see `createActiveFile`). */
export interface ActiveFile<F extends AgentFile<unknown>> {
  get(): F | null;
  set(file: F | null): void;
  /** Resolves once file `id` is open and ready; rejects if it isn't within a timeout. */
  waitFor(id: string): Promise<F>;
}
