import * as Y from "yjs";
import { generateKeyBetween } from "fractional-indexing";

import { isElement, kindOf, type CanvasElement, type ElementPatch } from "../elements";
import type { DocumentChange, ElementMap } from "./board-document.types";

/** Origin tag for local edits, so the undo manager only tracks this client's changes. */
export const LOCAL_ORIGIN = Symbol("local");
/** Origin for view-state edits (e.g. hiding a note) that shouldn't be undo steps. */
export const UI_ORIGIN = Symbol("ui");

/**
 * The board content, backed by a Yjs doc so persistence and real-time collaboration can plug in later.
 * Each element is a Y.Map of primitive fields (concurrent edits to different fields merge cleanly),
 * kept in the `"shapes"` map. Elements of types this version doesn't register stay in the doc
 * untouched but aren't returned.
 */
export class BoardDocument {
  readonly doc: Y.Doc;
  private readonly undoManager: Y.UndoManager;
  private readonly elements: Y.Map<ElementMap>;

  /** A document restored from `encode()` output. Loading it isn't an undoable change. */
  static fromUpdate(update: Uint8Array): BoardDocument {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, update);
    return new BoardDocument(doc);
  }

  constructor(doc = new Y.Doc()) {
    this.doc = doc;
    // The map keeps its original name so existing files load.
    this.elements = doc.getMap<ElementMap>("shapes");
    this.undoManager = new Y.UndoManager(this.elements, {
      trackedOrigins: new Set([LOCAL_ORIGIN]),
      captureTimeout: 400,
    });
  }

  get(id: string): CanvasElement | undefined {
    const map = this.elements.get(id);
    return map ? readElement(map) : undefined;
  }

  /** All elements sorted bottom-to-top. */
  all(): CanvasElement[] {
    const list: CanvasElement[] = [];
    this.elements.forEach((map) => {
      const el = readElement(map);
      if (el) list.push(el);
    });
    return list.sort(compareByIndex);
  }

  /** Index that places a new element above everything else. */
  nextIndex(): string {
    let top: string | null = null;
    this.elements.forEach((map) => {
      const index = map.get("index") as string;
      if (top === null || index > top) top = index;
    });
    return generateKeyBetween(top, null);
  }

  add(el: CanvasElement): void {
    this.transact(() => {
      const map = new Y.Map<unknown>();
      for (const [key, value] of Object.entries(el)) map.set(key, value);
      this.elements.set(el.id, map);
    });
  }

  update(id: string, patch: ElementPatch): void {
    const map = this.elements.get(id);
    if (!map) return;
    this.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined && map.get(key) !== value) map.set(key, value);
      }
    });
  }

  /** Like `update`, but not recorded in the undo history. */
  updateUntracked(id: string, patch: ElementPatch): void {
    const map = this.elements.get(id);
    if (!map) return;
    this.doc.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined && map.get(key) !== value) map.set(key, value);
      }
    }, UI_ORIGIN);
  }

  updateMany(patches: Map<string, ElementPatch>): void {
    this.transact(() => {
      for (const [id, patch] of patches) this.update(id, patch);
    });
  }

  remove(ids: Iterable<string>): void {
    this.transact(() => {
      for (const id of ids) this.elements.delete(id);
    });
  }

  /** Runs several edits as one transaction (and so one undo step). */
  batch(fn: () => void): void {
    this.transact(fn);
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
        if (event.target === this.elements) {
          for (const [id, info] of event.changes.keys) {
            if (info.action === "delete") change.removed.add(id);
            else change.updated.add(id);
          }
        } else {
          // A field changed inside an element map: its key in the parent map is the element id.
          const id = event.path[0];
          if (typeof id === "string") change.updated.add(id);
        }
      }
      for (const id of change.removed) change.updated.delete(id);
      listener(change);
    };
    this.elements.observeDeep(handler);
    return () => this.elements.unobserveDeep(handler);
  }

  /** The whole document as one Yjs update, for saving to a file. */
  encode(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  destroy(): void {
    this.undoManager.destroy();
  }

  private transact(fn: () => void): void {
    this.doc.transact(fn, LOCAL_ORIGIN);
  }
}

/** The element in a map, with defaults filled, or `undefined` when its type isn't registered. */
function readElement(map: ElementMap): CanvasElement | undefined {
  const data: unknown = map.toJSON();
  return isElement(data) ? kindOf(data).fillDefaults(data) : undefined;
}

export function compareByIndex(a: CanvasElement, b: CanvasElement): number {
  return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
}
