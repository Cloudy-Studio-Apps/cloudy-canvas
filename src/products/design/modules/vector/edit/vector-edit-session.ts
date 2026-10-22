import { defineService, Emitter } from "@canvas";

import type { VectorEditSelection } from "./vector-edit.types";

const NOTHING: VectorEditSelection = { vertices: new Set(), segments: new Set() };

/**
 * The vector being edited and what's selected in it, shared by the edit tools, their overlay and
 * the edit toolbar. `subscribe`/`getVersion` work with React's `useSyncExternalStore`.
 */
export class VectorEditSession {
  private id: string | null = null;
  private picked: VectorEditSelection = NOTHING;
  private version = 0;
  private readonly changes = new Emitter();

  get vectorId(): string | null {
    return this.id;
  }

  get selection(): VectorEditSelection {
    return this.picked;
  }

  start(id: string): void {
    this.id = id;
    this.picked = NOTHING;
    this.changed();
  }

  stop(): void {
    this.id = null;
    this.picked = NOTHING;
    this.changed();
  }

  select(vertices: Iterable<number>, segments: Iterable<number> = []): void {
    this.picked = { vertices: new Set(vertices), segments: new Set(segments) };
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
