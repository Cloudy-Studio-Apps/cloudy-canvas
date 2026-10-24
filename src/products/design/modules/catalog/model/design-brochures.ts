import {
  defineService,
  DocumentFeed,
  type CanvasDocument,
  type ElementPatch,
  type Point,
} from "@canvas";
import { createId } from "@shared/core";

import {
  BROCHURE_DEFAULTS,
  BROCHURE_TYPE,
  createBrochure,
  isBrochure,
  type BrochureElement,
} from "../brochure";
import { DesignBrochure } from "./design-brochure";
import type { ArrangedListener } from "./design-brochure.types";

/**
 * The design's brochures, each on one design page (a page can hold several), and the only place
 * that makes, renames and deletes them (one undo step each); `DesignBrochure` edits one. The open
 * brochure of a page (`current`) is the one opened last (`open`, view state outside the undo
 * history, kept with the file), else its first. Observes the document only while something
 * subscribes (`subscribe`/`getVersion` for `useSyncExternalStore`), so it needs no cleanup.
 */
export class DesignBrochures {
  private readonly feed: DocumentFeed;
  private readonly handles = new Map<string, DesignBrochure>();
  private readonly arranged = new Set<ArrangedListener>();

  constructor(private readonly doc: CanvasDocument) {
    // Renamed or redrawn frames change what the pages show, so every change counts.
    this.feed = new DocumentFeed(doc, () => true);
  }

  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  /** Listens for the frames and layers any of its brochures' arranges move (for their glide). */
  onArranged = (listener: ArrangedListener): (() => void) => {
    this.arranged.add(listener);
    return () => this.arranged.delete(listener);
  };

  /** Every brochure's record, in order (or only a design page's). */
  records(page?: string): BrochureElement[] {
    const records: BrochureElement[] = [];
    for (const id of this.doc.ids()) {
      if (this.doc.field(id, "type") !== BROCHURE_TYPE) continue;
      const el = this.doc.get(id);
      if (el && isBrochure(el) && (page === undefined || el.page === page)) records.push(el);
    }
    return records.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
  }

  /** A design page's brochures, in order. */
  list(page: string): DesignBrochure[] {
    return this.records(page).map((record) => this.handle(record.id));
  }

  /** A brochure by id, or `undefined` when there's none. */
  get(id: string): DesignBrochure | undefined {
    const el = this.doc.get(id);
    return el && isBrochure(el) ? this.handle(id) : undefined;
  }

  /** The open brochure of a design page: the one opened last, else its first; `null` for none. */
  current(page: string | null): DesignBrochure | null {
    if (page === null) return null;
    const records = this.records(page);
    let open = records[0];
    for (const record of records) {
      if ((record.openedAt ?? 0) > (open?.openedAt ?? 0)) open = record;
    }
    return open ? this.handle(open.id) : null;
  }

  /**
   * Adds a brochure to a design page, named `name` or "Brochure N", in one undo step, and opens it
   * unless `open` is false. Returns it.
   */
  create(page: string, name?: string, open = true): DesignBrochure {
    const record = createBrochure(this.doc.nextIndex(), page, name?.trim() || this.nextName(page));
    this.doc.checkpoint();
    this.doc.add(open ? { ...record, openedAt: Date.now() } : record);
    return this.handle(record.id);
  }

  /** Renames a brochure (an empty name is ignored). */
  rename(id: string, name: string): void {
    const text = name.trim();
    const record = this.get(id)?.record();
    if (!record || !text || record.name === text) return;
    this.doc.checkpoint();
    const patch: ElementPatch<BrochureElement> = { name: text };
    this.doc.update(id, patch);
  }

  /** Adds a copy of a brochure (its pages, options and settings) named "<name> copy", opened. */
  duplicate(id: string): DesignBrochure {
    const source = this.require(id);
    const copy = {
      ...createBrochure(this.doc.nextIndex(), source.page, `${source.name} copy`),
      slots: source.slots.map((slot) => ({ ...slot, id: createId() })),
      // Off, so the copy doesn't lay the frames it shares with the source out its own way.
      settings: { ...source.settings, arrange: "off" as const },
      openedAt: Date.now(),
    };
    this.doc.checkpoint();
    this.doc.add(copy);
    return this.handle(copy.id);
  }

  /** Deletes a brochure (its frames stay in the design). */
  remove(id: string): void {
    this.require(id);
    this.doc.checkpoint();
    this.doc.remove([id]);
  }

  /** Makes a brochure its design page's open one (view state: not an undo step). */
  open(id: string): void {
    const record = this.get(id)?.record();
    if (!record || this.current(record.page)?.id === id) return;
    const patch: ElementPatch<BrochureElement> = { openedAt: Date.now() };
    this.doc.updateUntracked(id, patch);
  }

  private require(id: string): BrochureElement {
    const record = this.get(id)?.record();
    if (!record) throw new Error(`There's no brochure with the id "${id}".`);
    return record;
  }

  private handle(id: string): DesignBrochure {
    let handle = this.handles.get(id);
    if (!handle) {
      handle = new DesignBrochure(this.doc, id, (moved) => this.emitArranged(moved));
      this.handles.set(id, handle);
    }
    return handle;
  }

  private emitArranged(moved: ReadonlyMap<string, Point>): void {
    for (const listener of this.arranged) listener(moved);
  }

  /** "Brochure N", one past the highest numbered brochure of the page ("Brochure" for the first). */
  private nextName(page: string): string {
    const base = BROCHURE_DEFAULTS.name;
    const records = this.records(page);
    if (records.length === 0) return base;
    let highest = 1;
    for (const record of records) {
      const match = new RegExp(`^${base} (\\d+)$`).exec(record.name);
      if (match) highest = Math.max(highest, Number(match[1]));
    }
    return `${base} ${Math.max(highest, records.length) + 1}`;
  }
}

/** The design's brochures (`engine.service(DESIGN_BROCHURES)`, `useService` in React). */
export const DESIGN_BROCHURES = defineService(
  "design.brochures",
  (doc) => new DesignBrochures(doc),
);

const byDocument = new WeakMap<CanvasDocument, DesignBrochures>();

/**
 * The brochures of a document, for code that has the document but no engine (a mode's `faded`
 * rule); one per document, like a service.
 */
export function brochuresOf(doc: CanvasDocument): DesignBrochures {
  let brochures = byDocument.get(doc);
  if (!brochures) {
    brochures = new DesignBrochures(doc);
    byDocument.set(doc, brochures);
  }
  return brochures;
}
