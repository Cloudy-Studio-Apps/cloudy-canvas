import * as Y from "yjs";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement, ElementKinds, ElementPatch } from "../elements";
import type {
  DocumentChange,
  DocumentMeta,
  DocumentMetaPatch,
  ElementMap,
} from "./canvas-document.types";

/** Origin tag for local edits, so the undo manager only tracks this client's changes. */
export const LOCAL_ORIGIN = Symbol("local");
/** Origin for view-state edits (e.g. hiding a note) that shouldn't be undo steps. */
export const UI_ORIGIN = Symbol("ui");

/**
 * A file's content, backed by a Yjs doc so persistence and real-time collaboration can plug in
 * later. Each element is a Y.Map of primitive fields (concurrent edits to different fields merge
 * cleanly), kept in the `"shapes"` map. It reads elements through the product's `kinds`: elements
 * of types that aren't registered stay in the doc untouched but aren't returned.
 */
export class CanvasDocument {
  readonly doc: Y.Doc;
  private readonly undoManager: Y.UndoManager;
  private readonly elements: Y.Map<ElementMap>;
  /** Binary data elements show (e.g. image files), by id. Shared by copies, outside undo history. */
  private readonly assets: Y.Map<Uint8Array>;
  /** The document's own title and description (`DocumentMeta`), undoable like elements. */
  private readonly metaMap: Y.Map<string>;
  /** What `add` does to new elements first (see `setPlacement`). */
  private placement: ((el: CanvasElement) => CanvasElement) | null = null;

  /** A document restored from `encode()` output. Loading it isn't an undoable change. */
  static fromUpdate(kinds: ElementKinds, update: Uint8Array): CanvasDocument {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, update);
    return new CanvasDocument(kinds, doc);
  }

  constructor(
    private readonly kinds: ElementKinds,
    doc = new Y.Doc(),
  ) {
    this.doc = doc;
    // The map keeps its original name so existing files load.
    this.elements = doc.getMap<ElementMap>("shapes");
    this.assets = doc.getMap<Uint8Array>("assets");
    this.metaMap = doc.getMap<string>("meta");
    this.undoManager = new Y.UndoManager([this.elements, this.metaMap], {
      trackedOrigins: new Set([LOCAL_ORIGIN]),
      captureTimeout: 400,
    });
  }

  get(id: string): CanvasElement | undefined {
    const map = this.elements.get(id);
    return map ? this.read(map) : undefined;
  }

  /** All elements sorted bottom-to-top. */
  all(): CanvasElement[] {
    const list: CanvasElement[] = [];
    this.elements.forEach((map) => {
      const el = this.read(map);
      if (el) list.push(el);
    });
    return list.sort(compareByIndex);
  }

  /** Index that places a new element above everything else. */
  nextIndex(): string {
    return generateKeyBetween(this.topIndex(), null);
  }

  /** `count` ascending indexes that place new elements above everything else. */
  nextIndexes(count: number): string[] {
    return generateNKeysBetween(this.topIndex(), null, count);
  }

  /** `count` ascending indexes that place elements below everything else. */
  firstIndexes(count: number): string[] {
    return generateNKeysBetween(null, this.bottomIndex(), count);
  }

  /**
   * Sets what `add` does to every new element before storing it (the engine places it in the
   * scope it shows, see `CanvasScopes`); `null` stores elements as they're given.
   */
  setPlacement(placement: ((el: CanvasElement) => CanvasElement) | null): void {
    this.placement = placement;
  }

  add(el: CanvasElement): void {
    this.transact(() => this.write(el));
  }

  /** Like `add`, but not recorded in the undo history (e.g. what a file needs when it opens). */
  addUntracked(el: CanvasElement): void {
    this.doc.transact(() => this.write(el), UI_ORIGIN);
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

  // ── Assets ──────────────────────────────────────────────────────────

  getAsset(id: string): Uint8Array | undefined {
    return this.assets.get(id);
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id);
  }

  /** Stores binary data under an id. Not an undo step: undoing the element that shows it is enough. */
  addAsset(id: string, data: Uint8Array): void {
    this.doc.transact(() => this.assets.set(id, data), LOCAL_ORIGIN);
  }

  // ── Metadata ────────────────────────────────────────────────────────

  meta(): DocumentMeta {
    return { title: this.metaText("title"), description: this.metaText("description") };
  }

  /** Sets the title and/or description (trimmed; `""` clears one). An undo step like any edit. */
  setMeta(patch: DocumentMetaPatch): void {
    this.transact(() => {
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        const text = value.trim();
        if (this.metaText(key) === text) continue;
        if (text) this.metaMap.set(key, text);
        else this.metaMap.delete(key);
      }
    });
  }

  /** Fires when the title or description changes. */
  observeMeta(listener: () => void): () => void {
    const handler = () => listener();
    this.metaMap.observe(handler);
    return () => this.metaMap.unobserve(handler);
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

  /**
   * Fires after any change to the document (elements, view state, assets, metadata): whatever
   * makes the file need saving.
   */
  onChange(listener: () => void): () => void {
    const handler = () => listener();
    this.doc.on("update", handler);
    return () => this.doc.off("update", handler);
  }

  /** The whole document as one Yjs update, for saving to a file. */
  encode(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  destroy(): void {
    this.undoManager.destroy();
  }

  /** The highest index in the document (every type, registered or not), or `null` when empty. */
  private topIndex(): string | null {
    let top: string | null = null;
    this.elements.forEach((map) => {
      const index = map.get("index") as string;
      if (top === null || index > top) top = index;
    });
    return top;
  }

  /** The lowest index in the document (every type, registered or not), or `null` when empty. */
  private bottomIndex(): string | null {
    let bottom: string | null = null;
    this.elements.forEach((map) => {
      const index = map.get("index") as string;
      if (bottom === null || index < bottom) bottom = index;
    });
    return bottom;
  }

  private metaText(key: string): string {
    const value = this.metaMap.get(key);
    return typeof value === "string" ? value : "";
  }

  /** Stores a new element, placed first (see `setPlacement`). */
  private write(el: CanvasElement): void {
    const placed = this.placement ? this.placement(el) : el;
    const map = new Y.Map<unknown>();
    for (const [key, value] of Object.entries(placed)) map.set(key, value);
    this.elements.set(placed.id, map);
  }

  private transact(fn: () => void): void {
    this.doc.transact(fn, LOCAL_ORIGIN);
  }

  /** The element in a map, with defaults filled, or `undefined` when its type isn't registered. */
  private read(map: ElementMap): CanvasElement | undefined {
    const data: unknown = map.toJSON();
    return this.kinds.isElement(data) ? this.kinds.kindOf(data).fillDefaults(data) : undefined;
  }
}

export function compareByIndex(a: CanvasElement, b: CanvasElement): number {
  return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
}
