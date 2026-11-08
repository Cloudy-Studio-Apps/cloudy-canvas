import { defineService, Emitter, type Point } from "@canvas";

import type { ConnectDragState, ConnectDrop } from "./connect-drag.types";

/**
 * The link being dragged in the Prototype mode (`ConnectGesture` writes it, the drag line draws
 * it), and what the last drag added. Every change notifies `onChange`.
 */
export class ConnectDrag {
  private current: ConnectDragState | null = null;
  private drop: ConnectDrop | null = null;
  private readonly changes = new Emitter();

  /** The drag on now, `null` when there's none. */
  state(): ConnectDragState | null {
    return this.current;
  }

  /** What the drag that just ended added, `null` when it added nothing (or one is on). */
  lastDrop(): ConnectDrop | null {
    return this.drop;
  }

  /** Starts a drag out of `from`, its line starting at `at`. */
  start(from: string, at: Point): void {
    this.current = { from, start: at, at, target: null };
    this.drop = null;
    this.changes.emit();
  }

  /** The pointer moved to `at`, over the screen `target` (or none). */
  move(at: Point, target: string | null): void {
    if (!this.current) return;
    this.current = { ...this.current, at, target };
    this.changes.emit();
  }

  /** Ends the drag, saying what it added (nothing by default). Does nothing without one. */
  end(drop: ConnectDrop | null = null): void {
    if (!this.current) return;
    this.current = null;
    this.drop = drop;
    this.changes.emit();
  }

  onChange(listener: () => void): () => void {
    return this.changes.subscribe(listener);
  }
}

/** The link being dragged (`ctx.service(CONNECT_DRAG)`, `useService` in React). */
export const CONNECT_DRAG = defineService("prototype.connectDrag", () => new ConnectDrag());
