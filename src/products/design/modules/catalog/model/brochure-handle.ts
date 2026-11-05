import type { CanvasDocument, ElementPatch, Point } from "@canvas";

import {
  BROCHURE_DEFAULTS,
  isBrochure,
  type BrochureElement,
  type BrochureSettings,
} from "../brochure";
import { arrangeBrochure, arrangedPages, type ArrangeMode } from "./arrange";
import { bookLayout } from "./book-layout";
import type { BookLayout } from "./book-layout.types";
import { brochurePages } from "./brochure-pages";
import type { BrochurePage } from "./brochure-pages.types";
import type { ArrangedListener } from "./design-brochure.types";
import { brochureExpansion } from "./repeats/brochure-expansion";
import type { BrochureExpansion } from "./repeats/expand-brochure.types";

/**
 * A brochure's reads, its one write and laying it out (the base of `DesignBrochure`). Reads go to
 * the document each time, so a handle never holds stale data; once its record is gone it reads as
 * empty and writes nothing. While its `arrange` setting isn't `off`, every write also lays its
 * frames out on the canvas in the same undo step (`arrangeBrochure`), and what moved is reported
 * to `onArranged`.
 */
export class BrochureHandle {
  constructor(
    protected readonly doc: CanvasDocument,
    readonly id: string,
    protected readonly onArranged: ArrangedListener = () => {},
  ) {}

  /** The record, or `undefined` once it's deleted. */
  record(): BrochureElement | undefined {
    const el = this.doc.get(this.id);
    return el && isBrochure(el) ? el : undefined;
  }

  get name(): string {
    return this.record()?.name ?? BROCHURE_DEFAULTS.name;
  }

  /** The design page it belongs to. */
  get page(): string {
    return this.record()?.page ?? "";
  }

  settings(): BrochureSettings {
    return this.record()?.settings ?? { ...BROCHURE_DEFAULTS.settings };
  }

  /** The pages, in order, with the frames that still exist on its design page. */
  pages(): BrochurePage[] {
    const brochure = this.record();
    return brochure ? brochurePages(this.doc, brochure) : [];
  }

  /** How the pages print and are read: sides, spreads, numbers (see `bookLayout`). */
  layout(): BookLayout {
    return bookLayout(this.pages(), this.settings());
  }

  /** The page a frame is printed on or is an option of (never a pending page). */
  pageOf(frameId: string): BrochurePage | undefined {
    return this.pages().find(
      (page) => !page.pending && page.options.some((option) => option.id === frameId),
    );
  }

  /** Its pages and sections with its repeats expanded (see `expandBrochure`). */
  expansion(): BrochureExpansion {
    const record = this.record();
    return record ? brochureExpansion(this.doc, record) : { pages: [], sections: [], pending: 0 };
  }

  /** How many pages its repeats will make at export but haven't ("+36 pages at export"). */
  pendingPages(): number {
    return this.expansion().pending;
  }

  /**
   * Lays the frames out once as the `arrange` setting says (`below` while it's `off`), pushing
   * other layers out of the way, in one undo step. Returns what moved (empty when it already was).
   */
  arrange(): ReadonlyMap<string, Point> {
    const record = this.record();
    if (!record) return new Map();
    const mode = record.settings.arrange === "off" ? "below" : record.settings.arrange;
    this.doc.checkpoint();
    let moved = new Map<string, Point>();
    this.doc.batch(() => {
      moved = this.arrangeAs(mode);
    });
    if (moved.size > 0) this.onArranged(moved);
    return moved;
  }

  /**
   * Lays the frames out again when the `arrange` setting is on (frames may have moved outside the
   * Catalog mode), in one undo step; nothing while it's off. Returns what moved.
   */
  keepArranged(): ReadonlyMap<string, Point> {
    return this.settings().arrange === "off" ? new Map() : this.arrange();
  }

  /**
   * One undo step patching the record (nothing once it's deleted), arranging the frames when
   * that's on; what follows from it (the pages' master copies) is written by the edit's hooks.
   */
  write(patch: ElementPatch<BrochureElement>): void {
    if (!this.record()) return;
    this.doc.checkpoint();
    let moved = new Map<string, Point>();
    this.doc.batch(() => {
      this.doc.update(this.id, patch);
      const { arrange } = this.settings();
      if (arrange !== "off") moved = this.arrangeAs(arrange);
    });
    if (moved.size > 0) this.onArranged(moved);
  }

  /** Lays the frames out as `mode` says, without a checkpoint (see `arrangeBrochure`). */
  private arrangeAs(mode: ArrangeMode): Map<string, Point> {
    const record = this.record();
    if (!record) return new Map();
    const pages = arrangedPages(brochurePages(this.doc, record));
    return arrangeBrochure(this.doc, record, bookLayout(pages, record.settings), pages, mode);
  }
}
