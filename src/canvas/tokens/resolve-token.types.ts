import type { ResolvedValue } from "./token.types";

/** One `resolveVariable` call's state (see `resolveIn`). */
export interface ResolveRun {
  visiting: Set<string>;
  done: Map<string, ResolvedValue | null>;
}
