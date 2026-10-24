import { defineService, DocumentFeed, type CanvasDocument, type ElementPatch } from "@canvas";

import {
  BROCHURE_DEFAULTS,
  createBrochure,
  type BrochureElement,
  type BrochureSettings,
  type BrochureSlot,
} from "../brochure";
import type { FrameElement } from "../../frame";
import { bookLayout } from "./book-layout";
import type { BookLayout } from "./book-layout.types";
import { brochureOf } from "./brochure-of";
import { brochurePages } from "./brochure-pages";
import type { BrochurePage } from "./brochure-pages.types";
import {
  addOption,
  addPages,
  chooseOption,
  moveSlot,
  pickPages,
  removeFrames,
  removeSlots,
  sameSlots,
} from "./slot-edits";

/**
 * The design's brochure (the Catalog mode's pages), and the only place that edits it: each edit
 * is one undo step, and the record is made by the first one. Observes the document only while
 * something subscribes (`subscribe`/`getVersion` for `useSyncExternalStore`), so it needs no
 * cleanup. Frames are kept by id; deleted ones are pruned with their deletion (`pruneBrochure`).
 */
export class DesignBrochure {
  private readonly feed: DocumentFeed;

  constructor(private readonly doc: CanvasDocument) {
    // Renamed or redrawn frames change what the pages show, so every change counts.
    this.feed = new DocumentFeed(doc, () => true);
  }

  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  /** The pages, in order, with the frames that still exist. */
  pages(): BrochurePage[] {
    const brochure = brochureOf(this.doc);
    return brochure ? brochurePages(this.doc, brochure) : [];
  }

  /** How the pages print and are read: sides, spreads, numbers (see `bookLayout`). */
  layout(): BookLayout {
    return bookLayout(this.pages(), this.settings());
  }

  /** The page a frame is printed on or is an option of. */
  pageOf(frameId: string): BrochurePage | undefined {
    return this.pages().find((page) => page.options.some((option) => option.id === frameId));
  }

  settings(): BrochureSettings {
    return brochureOf(this.doc)?.settings ?? { ...BROCHURE_DEFAULTS.settings };
  }

  /** Adds a page per frame not in the brochure yet, at `at` (default: the end). */
  addPages(frames: readonly string[], at?: number): void {
    this.writeSlots((slots) => addPages(slots, frames, at));
  }

  /** Adds a new frame to the design as the brochure's last page, in one undo step. */
  addNewPage(frame: FrameElement): void {
    this.doc.checkpoint();
    // One transaction: the frame and its page are one step.
    this.doc.batch(() => {
      this.doc.add(frame);
      this.addPages([frame.id]);
    });
  }

  /** Makes a frame an option of a page (taking it off another). */
  addOption(slotId: string, frame: string): void {
    this.writeSlots((slots) => addOption(slots, slotId, frame));
  }

  /** Picks which option of a page is printed. */
  choose(slotId: string, frame: string): void {
    this.writeSlots((slots) => chooseOption(slots, slotId, frame));
  }

  /** Moves a page to `position` (0-based). */
  move(slotId: string, position: number): void {
    this.writeSlots((slots) => moveSlot(slots, slotId, position));
  }

  removePages(slotIds: Iterable<string>): void {
    this.writeSlots((slots) => removeSlots(slots, slotIds));
  }

  /** Takes frames out of the brochure (they stay in the design). */
  removeFrames(frames: Iterable<string>): void {
    this.writeSlots((slots) => removeFrames(slots, frames));
  }

  /** What the pick tool's ticks on one design page make of the brochure (see `pickPages`). */
  pick(ticked: readonly string[], onPage: ReadonlySet<string>): void {
    this.writeSlots((slots) => pickPages(slots, ticked, onPage));
  }

  /** Replaces every page (agents' `set_brochure_pages`; the slots are checked by the caller). */
  setSlots(slots: readonly BrochureSlot[]): void {
    this.writeSlots(() => [...slots]);
  }

  setSettings(patch: Partial<BrochureSettings>): void {
    const settings = { ...this.settings(), ...patch };
    if (JSON.stringify(settings) === JSON.stringify(this.settings())) return;
    this.write({ settings });
  }

  private writeSlots(edit: (slots: readonly BrochureSlot[]) => BrochureSlot[]): void {
    const current = brochureOf(this.doc)?.slots ?? [];
    const slots = edit(current);
    if (!sameSlots(slots, current)) this.write({ slots });
  }

  /** One undo step: patches the record, or adds it with the patch. */
  private write(patch: ElementPatch<BrochureElement>): void {
    const brochure = brochureOf(this.doc);
    this.doc.checkpoint();
    if (brochure) this.doc.update(brochure.id, patch);
    else this.doc.add({ ...createBrochure(this.doc.nextIndex()), ...patch });
  }
}

export const DESIGN_BROCHURE = defineService("design.brochure", (doc) => new DesignBrochure(doc));
