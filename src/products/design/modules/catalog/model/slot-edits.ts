import { createId } from "@shared/core";

import type { BrochureSlot } from "../brochure";

// Pure edits of a brochure's slots: each returns the new list and never changes the one given.

/** A slot holding one frame. */
export function newSlot(frame: string): BrochureSlot {
  return { id: createId(), frames: [frame], chosen: frame };
}

/** Adds a page per frame that isn't in the brochure yet, at `at` (default: the end). */
export function addPages(
  slots: readonly BrochureSlot[],
  frames: readonly string[],
  at = slots.length,
): BrochureSlot[] {
  const used = framesOf(slots);
  const added = [...new Set(frames)].filter((frame) => !used.has(frame)).map(newSlot);
  const position = Math.max(0, Math.min(at, slots.length));
  return [...slots.slice(0, position), ...added, ...slots.slice(position)];
}

/** Makes a frame an option of a slot, taking it out of any other (left empty, it goes). */
export function addOption(
  slots: readonly BrochureSlot[],
  slotId: string,
  frame: string,
): BrochureSlot[] {
  const target = slots.find((slot) => slot.id === slotId);
  if (!target || target.frames.includes(frame)) return [...slots];
  return slots.flatMap((slot) =>
    slot === target
      ? [{ ...slot, frames: [...slot.frames, frame] }]
      : removeFrames([slot], [frame]),
  );
}

/** Picks which of a slot's options is printed. */
export function chooseOption(
  slots: readonly BrochureSlot[],
  slotId: string,
  frame: string,
): BrochureSlot[] {
  return slots.map((slot) =>
    slot.id === slotId && slot.frames.includes(frame) ? { ...slot, chosen: frame } : slot,
  );
}

/** Moves a slot to `position` (0-based) in the brochure. */
export function moveSlot(
  slots: readonly BrochureSlot[],
  slotId: string,
  position: number,
): BrochureSlot[] {
  const slot = slots.find((other) => other.id === slotId);
  if (!slot) return [...slots];
  const others = slots.filter((other) => other !== slot);
  const at = Math.max(0, Math.min(Math.round(position), others.length));
  return [...others.slice(0, at), slot, ...others.slice(at)];
}

export function removeSlots(
  slots: readonly BrochureSlot[],
  slotIds: Iterable<string>,
): BrochureSlot[] {
  const removed = new Set(slotIds);
  return slots.filter((slot) => !removed.has(slot.id));
}

/**
 * Takes frames out of the brochure: out of their slots, which go when they're left empty and
 * print their first option when the printed one went.
 */
export function removeFrames(
  slots: readonly BrochureSlot[],
  frames: Iterable<string>,
): BrochureSlot[] {
  const removed = new Set(frames);
  return slots.flatMap((slot) => {
    if (!slot.frames.some((frame) => removed.has(frame))) return [slot];
    const kept = slot.frames.filter((frame) => !removed.has(frame));
    const [first] = kept;
    if (first === undefined) return [];
    return [{ ...slot, frames: kept, chosen: kept.includes(slot.chosen) ? slot.chosen : first }];
  });
}

/**
 * What picking frames on one design page makes of the brochure: pages printing a frame of that
 * page that isn't ticked go, pages of other design pages stay, and ticked frames not in it yet are
 * added at the end in the order given (reading order).
 */
export function pickPages(
  slots: readonly BrochureSlot[],
  ticked: readonly string[],
  onPage: ReadonlySet<string>,
): BrochureSlot[] {
  const keep = new Set(ticked);
  const kept = slots.filter((slot) => !onPage.has(slot.chosen) || keep.has(slot.chosen));
  return addPages(kept, ticked);
}

/** Whether two slot lists are the same (so an edit that changes nothing writes nothing). */
export function sameSlots(a: readonly BrochureSlot[], b: readonly BrochureSlot[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function framesOf(slots: readonly BrochureSlot[]): Set<string> {
  return new Set(slots.flatMap((slot) => slot.frames));
}
