import type {
  BrochureElement,
  BrochureMaster,
  BrochureSection,
  BrochureSlot,
} from "../../brochure";

/** The master `id` renamed. */
export function renameMaster(
  masters: readonly BrochureMaster[],
  id: string,
  name: string,
): BrochureMaster[] {
  return masters.map((master) => (master.id === id ? { ...master, name } : master));
}

/**
 * The record without master `id`: pages that showed it go back to the default (or none when it
 * was the default), and it's no longer the default. Its frames stay in the design.
 */
export function withoutMaster(
  record: BrochureElement,
  id: string,
): Pick<BrochureElement, "masters" | "slots" | "settings"> {
  return {
    masters: record.masters.filter((master) => master.id !== id),
    slots: record.slots.map((slot) => {
      if (slot.master !== id) return slot;
      const rest = { ...slot };
      delete rest.master;
      return rest;
    }),
    settings:
      record.settings.defaultMaster === id
        ? { ...record.settings, defaultMaster: null }
        : record.settings,
  };
}

/** Slots `slotIds` showing `master` (`undefined`: the default; `null`: none). */
export function setSlotMaster(
  slots: readonly BrochureSlot[],
  slotIds: Iterable<string>,
  master: string | null | undefined,
): BrochureSlot[] {
  const ids = new Set(slotIds);
  return slots.map((slot) => {
    if (!ids.has(slot.id)) return slot;
    const rest = { ...slot };
    delete rest.master;
    return master === undefined ? rest : { ...rest, master };
  });
}

/** Slot `slotId` no longer stamping master layer `source` (it was detached there). */
export function skipMasterLayer(
  slots: readonly BrochureSlot[],
  slotId: string,
  sources: readonly string[],
): BrochureSlot[] {
  return slots.map((slot) => {
    if (slot.id !== slotId) return slot;
    const skip = [...new Set([...(slot.skip ?? []), ...sources])];
    return { ...slot, skip };
  });
}

/**
 * The sections that still start on a slot of the brochure, one per slot (the last given wins),
 * so a deleted page's section goes and the one before it runs on.
 */
export function keptSections(
  sections: readonly BrochureSection[],
  slots: readonly BrochureSlot[],
): BrochureSection[] {
  const present = new Set(slots.map((slot) => slot.id));
  const byStart = new Map<string, BrochureSection>();
  for (const section of sections)
    if (present.has(section.start)) byStart.set(section.start, section);
  return [...byStart.values()];
}

/**
 * Masters with frames that were deleted: the side becomes `null`, and a master with neither side
 * goes (see `withoutMaster` for what its pages do then).
 */
export function prunedMasters(
  masters: readonly BrochureMaster[],
  removed: ReadonlySet<string>,
): { masters: BrochureMaster[]; gone: string[] } {
  const gone: string[] = [];
  const kept: BrochureMaster[] = [];
  for (const master of masters) {
    const left = master.left !== null && removed.has(master.left) ? null : master.left;
    const right = master.right !== null && removed.has(master.right) ? null : master.right;
    if (left === null && right === null) gone.push(master.id);
    else
      kept.push(
        left === master.left && right === master.right ? master : { ...master, left, right },
      );
  }
  return { masters: kept, gone };
}
