import * as Y from "yjs";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement, ElementKinds, ElementPatch } from "../elements";
import type {
  AfterEdit,
  DocumentChange,
  DocumentMeta,
  DocumentMetaPatch,
  ElementMap,
} from "./canvas-document.types";

/** Origin tag for local edits, so the undo manager only tracks this client's changes. */
export const LOCAL_ORIGIN = Symbol("local");
/** Origin for view-state edits (e.g. hiding a note) that shouldn't be undo steps. */
export const UI_ORIGIN = Symbol("ui");
/** How many times an edit's `AfterEdit` hook may run on its own writes before it's stopped. */
const AFTER_EDIT_PASSES = 32;

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
  /** What runs after each edit (see `setAfterEdit`). */
  private afterEdit: AfterEdit | null = null;
  /** How deep the edits running now are nested (the hook runs when the outermost ends). */
  private depth = 0;
  /** How many `deferAfterEdit` holds are open. */
  private deferred = 0;
  /** What edits changed since the hook last ran. */
  private edited = new Set<string>();
  private removedSince: CanvasElement[] = [];
  private beforeSince = new Map<string, Record<string, unknown>>();

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

  /**
   * Sets what runs after every edit, inside it (`AfterEdit`), or `null` for nothing. Elements a
   * file opens with (`addUntracked`, `addAllUntracked`) don't run it: they're kept as they are.
   */
  setAfterEdit(afterEdit: AfterEdit | null): void {
    this.afterEdit = afterEdit;
    this.edited.clear();
    this.removedSince = [];
    this.beforeSince.clear();
  }

  /**
   * Holds the `AfterEdit` hook back (e.g. while a drag moves elements freely) until the returned
   * function is called, which runs it once with everything changed meanwhile.
   */
  deferAfterEdit(): () => void {
    this.deferred++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.deferred--;
      if (this.deferred === 0) this.transact(() => {});
    };
  }

  /** Every element's id (every type, registered or not). */
  ids(): string[] {
    return [...this.elements.keys()];
  }

  /** One stored field of an element, read without reading the whole element. */
  field(id: string, key: string): unknown {
    return this.elements.get(id)?.get(key);
  }

  add(el: CanvasElement): void {
    this.transact(() => this.write(el));
  }

  /** Like `add`, but not recorded in the undo history (e.g. what a file needs when it opens). */
  addUntracked(el: CanvasElement): void {
    this.doc.transact(() => this.write(el, false), UI_ORIGIN);
  }

  /** `addUntracked` for many elements in one transaction (e.g. a whole imported file). */
  addAllUntracked(elements: Iterable<CanvasElement>): void {
    this.doc.transact(() => {
      for (const el of elements) this.write(el, false);
    }, UI_ORIGIN);
  }

  update(id: string, patch: ElementPatch): void {
    this.transact(() => this.set(id, patch));
  }

  /** Like `update`, but not recorded in the undo history. */
  updateUntracked(id: string, patch: ElementPatch): void {
    this.run(() => this.set(id, patch), UI_ORIGIN);
  }

  updateMany(patches: Map<string, ElementPatch>): void {
    this.transact(() => {
      for (const [id, patch] of patches) this.update(id, patch);
    });
  }

  remove(ids: Iterable<string>): void {
    this.transact(() => {
      for (const id of ids) {
        if (this.afterEdit) {
          const el = this.get(id);
          if (el) this.removedSince.push(el);
        }
        this.elements.delete(id);
      }
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

  /** Stores a new element, placed first (see `setPlacement`); `edit` runs the `AfterEdit` hook. */
  private write(el: CanvasElement, edit = true): void {
    const placed = this.placement ? this.placement(el) : el;
    const map = new Y.Map<unknown>();
    for (const [key, value] of Object.entries(placed)) map.set(key, value);
    this.elements.set(placed.id, map);
    if (edit && this.afterEdit) this.edited.add(placed.id);
  }

  /** Writes the fields of `patch` that change. */
  private set(id: string, patch: ElementPatch): void {
    const map = this.elements.get(id);
    if (!map) return;
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || map.get(key) === value) continue;
      if (this.afterEdit) {
        this.edited.add(id);
        const before = this.beforeSince.get(id) ?? {};
        if (!(key in before)) before[key] = map.get(key);
        this.beforeSince.set(id, before);
      }
      map.set(key, value);
    }
  }

  private transact(fn: () => void): void {
    this.run(fn, LOCAL_ORIGIN);
  }

  /** Runs an edit in a transaction; when the outermost one ends, the `AfterEdit` hook runs. */
  private run(fn: () => void, origin: symbol): void {
    this.doc.transact(() => {
      this.depth++;
      try {
        fn();
      } finally {
        this.depth--;
      }
      if (this.depth === 0) this.settle();
    }, origin);
  }

  /** Runs the `AfterEdit` hook on what changed, then on what it changed, until nothing does. */
  private settle(): void {
    const afterEdit = this.afterEdit;
    if (!afterEdit || this.deferred > 0) return;
    for (let pass = 0; pass < AFTER_EDIT_PASSES; pass++) {
      if (this.edited.size === 0 && this.removedSince.length === 0) return;
      const change = { updated: this.edited, removed: this.removedSince, before: this.beforeSince };
      this.edited = new Set();
      this.removedSince = [];
      this.beforeSince = new Map();
      this.depth++;
      try {
        afterEdit(this, change);
      } finally {
        this.depth--;
      }
    }
    this.edited.clear();
    this.removedSince = [];
    this.beforeSince.clear();
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
