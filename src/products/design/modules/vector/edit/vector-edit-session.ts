import { defineService, Emitter } from "@canvas";

import type { RegionPick, RegionSelectionSession } from "../../core";
import type { VectorEditSelection } from "./vector-edit.types";

const NOTHING: VectorEditSelection = {
  vertices: new Set(),
  segments: new Set(),
  regionPicks: [],
};

/**
 * The vector being edited and what's selected in it (points, segments, regions), shared by the edit
 * tools, their overlay and the edit toolbar. Picked regions are mirrored into the core's
 * `REGION_SELECTION`, given at `start`, so the Fill section edits their fills. `subscribe`/`getVersion` work with React's `useSyncExternalStore`.
 */
export class VectorEditSession {
  private id: string | null = null;
  private picked: VectorEditSelection = NOTHING;
  private regionStore: RegionSelectionSession | null = null;
  private version = 0;
  private readonly changes = new Emitter();

  get vectorId(): string | null {
    return this.id;
  }

  get selection(): VectorEditSelection {
    return this.picked;
  }

  start(id: string, regionStore: RegionSelectionSession): void {
    this.regionStore?.set(null);
    this.id = id;
    this.regionStore = regionStore;
    this.picked = NOTHING;
    this.changed();
  }

  stop(): void {
    this.regionStore?.set(null);
    this.regionStore = null;
    this.id = null;
    this.picked = NOTHING;
    this.changed();
  }

  select(
    vertices: Iterable<number>,
    segments: Iterable<number> = [],
    regionPicks: readonly RegionPick[] = [],
  ): void {
    this.picked = { vertices: new Set(vertices), segments: new Set(segments), regionPicks };
    this.regionStore?.set(this.id ? { elementId: this.id, picks: regionPicks } : null);
    this.changed();
  }

  subscribe = (listener: () => void): (() => void) => this.changes.subscribe(listener);

  getVersion = (): number => this.version;

  private changed(): void {
    this.version++;
    this.changes.emit();
  }
}

/** The design's vector editing (`engine.service(VECTOR_EDIT)`). */
export const VECTOR_EDIT = defineService("design.vectorEdit", () => new VectorEditSession());
