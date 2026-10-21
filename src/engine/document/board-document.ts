import * as Y from "yjs";
import { generateKeyBetween } from "fractional-indexing";

import type { Shape, ShapePatch } from "./shapes.types";
import type { ShapeMap, DocumentChange } from "./board-document.types";

/** Origin tag for local edits, so the undo manager only tracks this client's changes. */
export const LOCAL_ORIGIN = Symbol("local");

/**
 * The board content, backed by a Yjs doc so persistence and real-time collaboration can plug in later.
 * Each shape is a Y.Map of primitive fields (concurrent edits to different fields merge cleanly).
 */
export class BoardDocument {
  readonly doc: Y.Doc;
  private readonly undoManager: Y.UndoManager;
  private readonly shapes: Y.Map<ShapeMap>;

  constructor(doc = new Y.Doc()) {
    this.doc = doc;
    this.shapes = doc.getMap<ShapeMap>("shapes");
    this.undoManager = new Y.UndoManager(this.shapes, {
      trackedOrigins: new Set([LOCAL_ORIGIN]),
      captureTimeout: 400,
    });
  }

  get(id: string): Shape | undefined {
    const map = this.shapes.get(id);
    return map ? readShape(map) : undefined;
  }

  /** All shapes sorted bottom-to-top. */
  all(): Shape[] {
    const list: Shape[] = [];
    this.shapes.forEach((map) => list.push(readShape(map)));
    return list.sort(compareByIndex);
  }

  /** Index that places a new shape above everything else. */
  nextIndex(): string {
    let top: string | null = null;
    this.shapes.forEach((map) => {
      const index = map.get("index") as string;
      if (top === null || index > top) top = index;
    });
    return generateKeyBetween(top, null);
  }

  add(shape: Shape): void {
    this.transact(() => {
      const map = new Y.Map<unknown>();
      for (const [key, value] of Object.entries(shape)) map.set(key, value);
      this.shapes.set(shape.id, map);
    });
  }

  update(id: string, patch: ShapePatch): void {
    const map = this.shapes.get(id);
    if (!map) return;
    this.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined && map.get(key) !== value) map.set(key, value);
      }
    });
  }

  updateMany(patches: Map<string, ShapePatch>): void {
    this.transact(() => {
      for (const [id, patch] of patches) this.update(id, patch);
    });
  }

  remove(ids: Iterable<string>): void {
    this.transact(() => {
      for (const id of ids) this.shapes.delete(id);
    });
  }

  // ── History (local changes only) ────────────────────────────────────

  /** Ends the current undo step so the next change starts a new one. */
  checkpoint(): void {
    this.undoManager.stopCapturing();
  }

  undo(): void {
    this.undoManager.undo();
  }

  redo(): void {
    this.undoManager.redo();
  }

  canUndo(): boolean {
    return this.undoManager.canUndo();
  }

  canRedo(): boolean {
    return this.undoManager.canRedo();
  }

  /** Fires when the undo/redo stacks change (after document observers have run). */
  onHistoryChange(listener: () => void): () => void {
    const events = ["stack-item-added", "stack-item-popped", "stack-cleared"] as const;
    for (const event of events) this.undoManager.on(event, listener);
    return () => {
      for (const event of events) this.undoManager.off(event, listener);
    };
  }

  // ── Changes ─────────────────────────────────────────────────────────

  observe(listener: (change: DocumentChange) => void): () => void {
    const handler = (events: Y.YEvent<Y.AbstractType<unknown>>[]) => {
      const change: DocumentChange = { updated: new Set(), removed: new Set() };
      for (const event of events) {
        if (event.target === this.shapes) {
          for (const [id, info] of event.changes.keys) {
            if (info.action === "delete") change.removed.add(id);
            else change.updated.add(id);
          }
        } else {
          // A field changed inside a shape map: its key in the parent map is the shape id.
          const id = event.path[0];
          if (typeof id === "string") change.updated.add(id);
        }
      }
      for (const id of change.removed) change.updated.delete(id);
      listener(change);
    };
    this.shapes.observeDeep(handler);
    return () => this.shapes.unobserveDeep(handler);
  }

  destroy(): void {
    this.undoManager.destroy();
  }

  private transact(fn: () => void): void {
    this.doc.transact(fn, LOCAL_ORIGIN);
  }
}

function readShape(map: ShapeMap): Shape {
  return map.toJSON() as Shape;
}

export function compareByIndex(a: Shape, b: Shape): number {
  return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
}
