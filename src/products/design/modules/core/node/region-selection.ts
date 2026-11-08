import { defineService, Emitter } from "@canvas";

import type { RegionTarget } from "./region-selection.types";

/**
 * The vector regions picked in the vector edit mode, so the Fill section (core) can edit their
 * fills without knowing the edit mode. The edit session writes it; `subscribe`/`getVersion` work
 * with React's `useSyncExternalStore`.
 */
export class RegionSelectionSession {
  private current: RegionTarget | null = null;
  private version = 0;
  private readonly changes = new Emitter();

  get target(): RegionTarget | null {
    return this.current;
  }

  set(target: RegionTarget | null): void {
    const next = target && target.picks.length > 0 ? target : null;
    if (sameTarget(this.current, next)) return;
    this.current = next;
    this.version++;
    this.changes.emit();
  }

  subscribe = (listener: () => void): (() => void) => this.changes.subscribe(listener);

  getVersion = (): number => this.version;
}

function sameTarget(a: RegionTarget | null, b: RegionTarget | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.elementId === b.elementId &&
    a.picks.length === b.picks.length &&
    a.picks.every((pick, i) => pick.index === b.picks[i]?.index && pick.key === b.picks[i]?.key)
  );
}

/** The design's picked vector regions (`engine.service(REGION_SELECTION)`). */
export const REGION_SELECTION = defineService(
  "design.regionSelection",
  () => new RegionSelectionSession(),
);
