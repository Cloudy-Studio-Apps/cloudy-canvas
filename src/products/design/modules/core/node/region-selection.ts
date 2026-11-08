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
    if (!target && !this.current) return;
    this.current = target && target.regions.length > 0 ? target : null;
    this.version++;
    this.changes.emit();
  }

  subscribe = (listener: () => void): (() => void) => this.changes.subscribe(listener);

  getVersion = (): number => this.version;
}

/** The design's picked vector regions (`engine.service(REGION_SELECTION)`). */
export const REGION_SELECTION = defineService(
  "design.regionSelection",
  () => new RegionSelectionSession(),
);
