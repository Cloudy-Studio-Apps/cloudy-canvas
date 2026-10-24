import type { CanvasDocument, ElementPatch } from "@canvas";

import {
  BROCHURE_DEFAULTS,
  isBrochure,
  type BrochureElement,
  type BrochureSettings,
  type BrochureSlot,
} from "../brochure";
import type { FrameElement } from "../../frame";
import { bookLayout } from "./book-layout";
import type { BookLayout } from "./book-layout.types";
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
  setOptions,
} from "./slot-edits";

/**
 * One brochure (a record of `DESIGN_BROCHURES`, which hands these out) and the only place that
 * edits its pages and settings: each edit is one undo step. Frames are kept by id; deleted ones
 * are pruned with their deletion (`pruneBrochure`). Reads go to the document each time, so a
 * handle never holds stale data; once its record is gone it reads as empty and writes nothing.
 */
export class DesignBrochure {
  constructor(
    private readonly doc: CanvasDocument,
    readonly id: string,
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

  /** The pages, in order, with the frames that still exist on its design page. */
  pages(): BrochurePage[] {
    const brochure = this.record();
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
    return this.record()?.settings ?? { ...BROCHURE_DEFAULTS.settings };
  }

  /** Adds a page per frame not in the brochure yet, at `at` (default: the end). */
  addPages(frames: readonly string[], at?: number): void {
    this.writeSlots((slots) => addPages(slots, frames, at));
  }

  /** Adds a new frame to the design as a page at `at` (default: the end), in one undo step. */
  addNewPage(frame: FrameElement, at?: number): void {
    this.doc.checkpoint();
    // One transaction: the frame and its page are one step.
    this.doc.batch(() => {
      this.doc.add(frame);
      this.addPages([frame.id], at);
    });
  }

  /** Gives a page these options, in order, printing `chosen` (see `setOptions`). */
  setOptions(slotId: string, frames: readonly string[], chosen?: string): void {
    this.writeSlots((slots) => setOptions(slots, slotId, frames, chosen));
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

  /** What the pick tool's ticks on its design page make of the brochure (see `pickPages`). */
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
    const current = this.record()?.slots ?? [];
    const slots = edit(current);
    if (!sameSlots(slots, current)) this.write({ slots });
  }

  /** One undo step patching the record (nothing once it's deleted). */
  private write(patch: ElementPatch<BrochureElement>): void {
    if (!this.record()) return;
    this.doc.checkpoint();
    this.doc.update(this.id, patch);
  }
}
