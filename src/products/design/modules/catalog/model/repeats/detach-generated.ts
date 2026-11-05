import type { BrochureElement, BrochureSlot } from "../../brochure";
import type { BrochureRepeat, DetachedSlot } from "./brochure-repeat.types";
import { copyPathKey, segmentOwner } from "./copy-segment";
import type { DetachEdit } from "./detach-generated.types";

interface Cut extends DetachedSlot {
  path: readonly string[];
}

/** Whether `path` is `prefix` or inside it (a copy made in that copy's pass). */
const within = (path: readonly string[], prefix: readonly string[]) =>
  prefix.length <= path.length && prefix.every((segment, i) => path[i] === segment);

/**
 * Takes copies a repeat made (`copies`, generated slots, in `record.slots` or just left out of
 * them) out of their repeats by hand, as a detach: each copy's path (`copyPathKey`) joins its
 * loop's `detached` (the innermost loop of its path), so the sync never makes that copy again.
 * A copy is its loop's whole pass, so every page made in it (a section copy's other pages, its
 * inner loops' copies) is taken out with it: those still in the record stay where they are as
 * plain pages (`detached`, no `generated`), except the slots in `drop`, which go. Every frame of
 * a copy taken out is listed in `free`, to be untagged and unlocked. Pure.
 */
export function detachGenerated(
  record: Pick<BrochureElement, "slots" | "sections">,
  copies: readonly BrochureSlot[],
  drop: ReadonlySet<string> = new Set(),
): DetachEdit {
  const cuts: Cut[] = [];
  for (const slot of copies) {
    const path = slot.generated?.path ?? [];
    const last = path[path.length - 1];
    if (last === undefined) continue;
    const key = copyPathKey(path);
    if (!cuts.some((cut) => cut.key === key)) cuts.push({ owner: segmentOwner(last), key, path });
  }
  // A page in two copies taken out (one inside the other) goes with the outer one.
  cuts.sort((a, b) => a.path.length - b.path.length);
  const keys = new Map<string, string[]>();
  for (const cut of cuts) keys.set(cut.owner, [...(keys.get(cut.owner) ?? []), cut.key]);
  const withKeys = <T extends { id: string; repeat?: BrochureRepeat }>(item: T): T => {
    const added = (keys.get(item.id) ?? []).filter((key) => !item.repeat?.detached.includes(key));
    if (!item.repeat || added.length === 0) return item;
    return { ...item, repeat: { ...item.repeat, detached: [...item.repeat.detached, ...added] } };
  };

  const free: string[] = [];
  const taken = new Set<string>();
  const slots = record.slots.flatMap((slot): BrochureSlot[] => {
    const path = slot.generated?.path;
    const cut = path ? cuts.find((item) => within(path, item.path)) : undefined;
    if (!cut) return [withKeys(slot)];
    taken.add(slot.id);
    free.push(...slot.frames);
    if (drop.has(slot.id)) return [];
    const plain: BrochureSlot = { ...slot, detached: { owner: cut.owner, key: cut.key } };
    delete plain.generated;
    return [plain];
  });
  for (const slot of copies) if (!taken.has(slot.id)) free.push(...slot.frames);
  return { slots, sections: record.sections.map(withKeys), free };
}
