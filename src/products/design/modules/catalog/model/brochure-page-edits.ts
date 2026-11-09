import type { BrochureSlot } from "../brochure";
import type { FrameElement } from "../../frame";
import { BrochureHandle } from "./brochure-handle";
import { keptSections } from "./masters/master-edits";
import { detachPages } from "./repeats/detach-pages";
import { detachPasses } from "./repeats/detach-passes";
import { copyPassPath } from "./repeats/copy-pass-path";
import { copyRows } from "./repeats/copy-rows";
import { UnreadableCopyError } from "./repeats/unreadable-copy-error";
import type { DetachEdit } from "./repeats/detach-generated.types";
import { freedCopyPatches } from "./repeats/freed-copy-patches";
import { withoutStaleDetached } from "./repeats/stale-detached";
import {
  addOption,
  addPages,
  chooseOption,
  keepingSlots,
  moveSlot,
  moveSlots,
  pickPages,
  removeFrames,
  removeSlots,
  sameSlots,
  setOptions,
} from "./slot-edits";

/**
 * A brochure's page edits (the middle of `DesignBrochure`), each one undo step. A page a repeat
 * made is never taken out as such: taking it out detaches it (it stays where it is, a plain page),
 * leaving it out of the pages (`setSlots`, the pick tool) detaches it and takes it out; either way
 * that page isn't made again while the rest of its copy is (`detachPages`).
 */
export class BrochurePageEdits extends BrochureHandle {
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

  /** Moves pages together to `position` (0-based, among the others), keeping their order. */
  moveMany(slotIds: readonly string[], position: number): void {
    this.writeSlots((slots) => moveSlots(slots, slotIds, position));
  }

  /** Takes pages out of the brochure (their frames stay in the design); a copy is detached. */
  removePages(slotIds: Iterable<string>): void {
    const ids = new Set(slotIds);
    const copies = this.copies((slot) => ids.has(slot.id));
    for (const slot of copies) ids.delete(slot.id);
    this.writeSlots(
      (slots) => removeSlots(slots, ids),
      (edited) => detachPages(edited, copies, this.rowsOf()),
    );
  }

  /** Takes frames out of the brochure (they stay in the design); a copy's page is detached. */
  removeFrames(frames: Iterable<string>): void {
    const gone = new Set(frames);
    const copies = this.copies((slot) => slot.frames.some((frame) => gone.has(frame)));
    const copied = new Set(copies.flatMap((slot) => slot.frames));
    const out = [...gone].filter((frame) => !copied.has(frame));
    this.writeSlots(
      (slots) => removeFrames(slots, out),
      (edited) => detachPages(edited, copies, this.rowsOf()),
    );
  }

  /**
   * Detaches a whole copy (a copy section's folder, `sectionId` its expanded id, that is a pass of
   * its own repeat, `copyPassPath`) from the repeat: its row's pass is never made again, and every
   * page made in it (its subsections' and inner loops' too) stays where it is as a plain page
   * (`detachPasses`). Nothing for another section. Returns the slots of the copy's pages, those
   * detached before included.
   */
  detachSection(sectionId: string): string[] {
    const path = copyPassPath(this.expansion(), sectionId);
    if (!path) return [];
    const inside = (of: readonly string[] | undefined) =>
      !!of && path.every((segment, i) => of[i] === segment);
    const ids = (this.record()?.slots ?? [])
      .filter((slot) => inside(slot.generated?.path) || inside(slot.detached?.path))
      .map((slot) => slot.id);
    const rowsOf = this.rowsOf();
    this.writeSlots(
      (slots) => [...slots],
      (edited) => detachPasses(edited, [path], rowsOf),
    );
    return ids;
  }

  /** What the pick tool's ticks make of the brochure (`pickPages`); a copy unticked is detached. */
  pick(ticked: readonly string[], onPage: ReadonlySet<string>): void {
    const keep = new Set(ticked);
    const copies = this.copies((slot) => onPage.has(slot.chosen) && !keep.has(slot.chosen));
    this.writeSlots(
      (slots) => pickPages(slots, ticked, onPage),
      (edited) => detachPages(edited, copies, this.rowsOf()),
    );
  }

  /**
   * Replaces every page (agents' `catalog_pages_set`; the slots are checked by the caller). A page
   * printing the frame one printed is that one (`keepingSlots`); a copy left out is detached.
   */
  setSlots(slots: readonly BrochureSlot[]): void {
    const next = keepingSlots(this.record()?.slots ?? [], slots);
    const kept = new Set(next.map((slot) => slot.id));
    const copies = this.copies((slot) => !kept.has(slot.id));
    this.writeSlots(
      () => next,
      (edited) => detachPages(edited, copies, this.rowsOf()),
    );
  }

  /**
   * The rows each copy shows now (`copyRows`), read before an edit changes them. Throws
   * `UnreadableCopyError` for a copy whose rows can't be read here: nothing is written then.
   */
  protected rowsOf(): (slot: BrochureSlot) => readonly string[] {
    const read = copyRows(this.expansion());
    return (slot) => {
      const rows = read(slot);
      if (!rows) throw new UnreadableCopyError();
      return rows;
    };
  }

  /**
   * Throws `UnreadableCopyError` when one of `frames` is a page a repeat made whose rows can't be
   * read on this device, before deleting it (`deleteSelectedPages`).
   */
  checkCopies(frames: Iterable<string>): void {
    const ids = new Set(frames);
    const read = this.rowsOf();
    for (const slot of this.copies((item) => item.frames.some((frame) => ids.has(frame)))) {
      read(slot);
    }
  }

  /** The pages its repeats made that `test` picks. */
  protected copies(test: (slot: BrochureSlot) => boolean): BrochureSlot[] {
    return (this.record()?.slots ?? []).filter((slot) => slot.generated && test(slot));
  }

  /**
   * Writes a slot edit in one undo step, then `detach` (copies taken out, whose layers are freed,
   * `freedCopyPatches`); a section starting on a page that went goes, and what loops that are gone
   * left is cleared (`withoutStaleDetached`). Nothing when nothing changes.
   */
  private writeSlots(
    edit: (slots: readonly BrochureSlot[]) => BrochureSlot[],
    detach?: (record: { slots: BrochureSlot[]; sections: DetachEdit["sections"] }) => DetachEdit,
  ): void {
    const record = this.record();
    if (!record) return;
    const edited = { slots: edit(record.slots), sections: record.sections };
    const detached = detach?.(edited);
    const { slots, sections } = withoutStaleDetached(detached ?? edited);
    const free = detached?.free ?? [];
    // A section starting on a page that went goes; the one before it runs on.
    const kept = keptSections(sections, slots);
    const same = JSON.stringify(kept) === JSON.stringify(record.sections);
    if (free.length === 0 && same && sameSlots(slots, record.slots)) return;
    const freed = freedCopyPatches(this.doc, record.id, free);
    const patch = same ? { slots } : { slots, sections: kept };
    this.doc.checkpoint();
    this.doc.batch(() => {
      if (freed.size > 0) this.doc.updateMany(freed);
      this.write(patch);
    });
  }
}
