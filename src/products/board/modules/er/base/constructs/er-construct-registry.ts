import { BUILT_IN_ER_CONSTRUCTS } from "./built-in-constructs";
import type { ErConstructDefinition } from "./er-construct.types";

/**
 * The constructs installed: what the board's `erConstructs` point holds once the modules have
 * loaded (the er module points it there with `useSource`), else the built-ins (scripts, tests).
 */
export class ErConstructRegistry {
  private source: () => readonly ErConstructDefinition[] = () => BUILT_IN_ER_CONSTRUCTS;

  /** Where the constructs come from (read on every lookup, so plugins loaded later count). */
  useSource(source: () => readonly ErConstructDefinition[]): void {
    this.source = source;
  }

  list(): readonly ErConstructDefinition[] {
    const constructs = this.source();
    return constructs.length > 0 ? constructs : BUILT_IN_ER_CONSTRUCTS;
  }

  get(id: string): ErConstructDefinition | undefined {
    return this.list().find((construct) => construct.id === id);
  }
}

/** The board's ER constructs (see `ErConstructRegistry`). */
export const erConstructs = new ErConstructRegistry();
