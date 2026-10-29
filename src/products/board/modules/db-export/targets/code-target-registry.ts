import { BUILT_IN_CODE_TARGETS } from "./built-in-targets";
import type { CodeTargetDefinition } from "./code-target.types";

/**
 * The code targets installed: what the board's `boardCodeTargets` point holds once the modules
 * have loaded (the db-export module points it there with `useSource`), else the built-ins. The
 * dialog and the agent tools read targets only through it.
 */
export class CodeTargetRegistry {
  private source: () => readonly CodeTargetDefinition[] = () => BUILT_IN_CODE_TARGETS;

  /** Where the targets come from (read on every lookup, so plugins loaded later count). */
  useSource(source: () => readonly CodeTargetDefinition[]): void {
    this.source = source;
  }

  list(): readonly CodeTargetDefinition[] {
    const targets = this.source();
    return targets.length > 0 ? targets : BUILT_IN_CODE_TARGETS;
  }

  /** The target installed with this id, or `undefined`. */
  get(id: string): CodeTargetDefinition | undefined {
    return this.list().find((target) => target.id === id);
  }
}

/** The board's code targets (see `CodeTargetRegistry`). */
export const codeTargets = new CodeTargetRegistry();
