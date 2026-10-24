import * as Y from "yjs";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

import type { CanvasElement, ElementKinds, ElementPatch } from "../elements";
import type {
  AfterEdit,
  DocumentActor,
  DocumentChange,
  DocumentMeta,
  DocumentMetaPatch,
  ElementMap,
  Placement,
} from "./canvas-document.types";
import { DocumentHistory } from "./document-history";
import type { HistoryChange } from "./document-history.types";

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
  /** The local user's undo history (edits made with `LOCAL_ORIGIN`). */
  readonly history: DocumentHistory;
  private readonly elements: Y.Map<ElementMap>;
  /** Binary data elements show (e.g. image files), by id. Shared by copies, outside undo history. */
  private readonly assets: Y.Map<Uint8Array>;
  /** The document's own title and description (`DocumentMeta`), undoable like elements. */
  private readonly metaMap: Y.Map<string>;
  /** What `add` does to new elements first (see `setPlacement`). */
  private placement: Placement | null = null;
  /** Who the edits running now are by (see `runAs`): the local user unless an actor is set. */
  private actor: DocumentActor = { origin: LOCAL_ORIGIN, placement: null };
  /** What runs after each edit (see `setAfterEdit`). */
  private afterEdit: AfterEdit | null = null;
  /** Local edits are ignored (see `setReadOnly`). */
  private readOnly = false;
  /** How deep the edits running now are nested (the hook runs when the outermost ends). */
  private depth = 0;
  /** How many `deferAfterEdit` holds are open. */
  private deferred = 0;
  /** What edits changed since the hook last ran. */
  private edited = new Set<string>();
  private removedSince: CanvasElement[] = [];
  private beforeSince = new Map<string, Record<string, unknown>>();
  /**
   * Elements as last read, by id (`null`: a type that isn't registered), dropped when they change,
   * so a change to a few elements doesn't read the whole document again. Shared by every reader:
   * never mutate one (they're frozen in development).
   */
  private readonly cache = new Map<string, CanvasElement | null>();
  /** Every element bottom to top, while no element changed since it was built. */
  private sorted: CanvasElement[] | null = null;

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
    this.history = this.createHistory(LOCAL_ORIGIN);
    // Undo, redo and remote updates change maps without going through this class's writes.
    doc.on("beforeObserverCalls", this.forgetChanged);
  }

  get(id: string): CanvasElement | undefined {
    return this.cached(id) ?? undefined;
  }

  /** All elements sorted bottom-to-top (a new array; the elements are shared, see `cache`). */
  all(): CanvasElement[] {
    if (!this.sorted) {
      const list: CanvasElement[] = [];
      for (const id of this.elements.keys()) {
        const el = this.cached(id);
        if (el) list.push(el);
      }
      this.sorted = list.sort(compareByIndex);
    }
    return [...this.sorted];
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
  setPlacement(placement: Placement | null): void {
    this.placement = placement;
  }

  /**
   * Runs `fn` with its edits made by `actor`: with its transaction origin (so they go to its undo
   * history, not the user's) and its placement for new elements. Edits are synchronous, so the
   * actor never leaks into anyone else's; calls nest.
   */
  runAs<T>(actor: DocumentActor, fn: () => T): T {
    const previous = this.actor;
    this.actor = actor;
    try {
      return fn();
    } finally {
      this.actor = previous;
    }
  }

  /** A new undo history recording only the edits made with `origin` (see `runAs`). */
  createHistory(origin: symbol): DocumentHistory {
    return new DocumentHistory([this.elements, this.metaMap], origin);
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

  /**
   * Makes every local edit (elements, assets, metadata, undo and redo) do nothing, whoever makes
   * it (tools, panels, agents): a live session's viewer. Changes applied to `doc` directly (what
   * the host sends) still come in.
   */
  setReadOnly(readOnly: boolean): void {
    this.readOnly = readOnly;
  }

  get isReadOnly(): boolean {
    return this.readOnly;
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
    if (this.readOnly) return;
    this.doc.transact(() => this.write(el, false), UI_ORIGIN);
  }

  /** `addUntracked` for many elements in one transaction (e.g. a whole imported file). */
  addAllUntracked(elements: Iterable<CanvasElement>): void {
    if (this.readOnly) return;
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
        this.forget(id);
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
    if (this.readOnly) return;
    this.doc.transact(() => this.assets.set(id, data), this.actor.origin);
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

  // ── History (the local user's changes only, see `history`) ──────────

  /** Ends the current undo step so the next change starts a new one. */
  checkpoint(): void {
    this.history.checkpoint();
  }

  undo(): void {
    if (!this.readOnly) this.history.undo();
  }

  redo(): void {
    if (!this.readOnly) this.history.redo();
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  /** Fires when the undo/redo stacks change (after document observers have run). */
  onHistoryChange(listener: (change: HistoryChange) => void): () => void {
    return this.history.onChange(listener);
  }

  // ── Changes ─────────────────────────────────────────────────────────

  observe(listener: (change: DocumentChange) => void): () => void {
    const handler = (events: Y.YEvent<Y.AbstractType<unknown>>[]) => {
      const fields = new Map<string, Set<string> | "all">();
      const change: DocumentChange = { updated: new Set(), removed: new Set(), fields };
      for (const event of events) {
        if (event.target === this.elements) {
          for (const [id, info] of event.changes.keys) {
            if (info.action === "delete") change.removed.add(id);
            else {
              change.updated.add(id);
              fields.set(id, "all");
            }
          }
        } else {
          // A field changed inside an element map: its key in the parent map is the element id.
          const id = event.path[0];
          if (typeof id !== "string") continue;
          change.updated.add(id);
          const known = fields.get(id) ?? new Set<string>();
          if (known === "all") continue;
          for (const key of event.changes.keys.keys()) known.add(key);
          fields.set(id, known);
        }
      }
      for (const id of change.removed) {
        change.updated.delete(id);
        fields.delete(id);
      }
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
    this.doc.off("beforeObserverCalls", this.forgetChanged);
    this.history.destroy();
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
    const placement = this.actor.placement ?? this.placement;
    const placed = placement ? placement(el) : el;
    const map = new Y.Map<unknown>();
    for (const [key, value] of Object.entries(placed)) map.set(key, value);
    this.elements.set(placed.id, map);
    this.forget(placed.id);
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
      this.forget(id);
    }
  }

  private transact(fn: () => void): void {
    this.run(fn, this.actor.origin);
  }

  /** Runs an edit in a transaction; when the outermost one ends, the `AfterEdit` hook runs. */
  private run(fn: () => void, origin: symbol): void {
    if (this.readOnly) return;
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

  /** The element with this id as last read (`null`: none, or a type that isn't registered). */
  private cached(id: string): CanvasElement | null {
    const known = this.cache.get(id);
    if (known !== undefined) return known;
    const map = this.elements.get(id);
    if (!map) return null;
    const el = this.read(map);
    this.cache.set(id, el);
    return el;
  }

  /** Drops an element's cached read (it changed, or is gone). */
  private forget(id: string): void {
    this.cache.delete(id);
    this.sorted = null;
  }

  /** Drops the cached reads of the elements a transaction changed. */
  private readonly forgetChanged = (transaction: Y.Transaction): void => {
    const elements: unknown = this.elements;
    for (const [type, keys] of transaction.changed) {
      if (type === elements) {
        for (const id of keys) if (id !== null) this.forget(id);
      } else if (type.parent === elements) {
        // A field changed inside an element map: its key in the parent map is the element id.
        const id = type._item?.parentSub;
        if (id) this.forget(id);
      }
    }
  };

  /** The element in a map, with defaults filled, or `null` when its type isn't registered. */
  private read(map: ElementMap): CanvasElement | null {
    const data: unknown = map.toJSON();
    if (!this.kinds.isElement(data)) return null;
    const el = this.kinds.kindOf(data).fillDefaults(data);
    // Reads are shared: a reader changing one would change everyone's.
    return import.meta.env.DEV ? Object.freeze(el) : el;
  }
}

export function compareByIndex(a: CanvasElement, b: CanvasElement): number {
  return a.index < b.index ? -1 : a.index > b.index ? 1 : 0;
}
