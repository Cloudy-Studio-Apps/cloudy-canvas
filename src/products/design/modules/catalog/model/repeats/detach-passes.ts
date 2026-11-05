import type { BrochureElement, BrochureSlot } from "../../brochure";
import { copyPathKey, segmentOwner } from "./copy-segment";
import { addKey, withRepeatKeys } from "./repeat-keys";
import type { DetachCut, DetachEdit } from "./detach-generated.types";

/** Whether `path` is `prefix` or inside it (a copy made in that copy's pass). */
const within = (path: readonly string[], prefix: readonly string[]) =>
  prefix.length <= path.length && prefix.every((segment, i) => path[i] === segment);

/**
 * Takes whole copies out of their repeats (a copy section's folder): each copy path (`paths`,
 * `copySegment`s) joins its loop's `detached` (the loop of its last segment), so that row's pass
 * is never made again, and every page made in it (its subsections and inner loops' copies too)
 * stays where it is as a plain page (`detached`, no `generated`), except the slots in `drop`,
 * which go. Every frame of those pages is listed in `free`. Pure.
 */
export function detachPasses(
  record: Pick<BrochureElement, "slots" | "sections">,
  paths: readonly (readonly string[])[],
  drop: ReadonlySet<string> = new Set(),
): DetachEdit {
  const cuts: DetachCut[] = [];
  for (const path of paths) {
    const last = path[path.length - 1];
    const key = copyPathKey(path);
    if (last !== undefined && !cuts.some((cut) => cut.key === key)) {
      cuts.push({ owner: segmentOwner(last), key, path });
    }
  }
  // A page in two copies taken out (one inside the other) goes with the outer one.
  cuts.sort((a, b) => a.path.length - b.path.length);
  const keys = new Map<string, string[]>();
  for (const cut of cuts) addKey(keys, cut.owner, cut.key);

  const free: string[] = [];
  const slots = record.slots.flatMap((slot): BrochureSlot[] => {
    const generated = slot.generated;
    const cut = generated ? cuts.find((item) => within(generated.path, item.path)) : undefined;
    if (!generated || !cut) return [withRepeatKeys(slot, keys, "detached")];
    free.push(...slot.frames);
    if (drop.has(slot.id)) return [];
    const plain: BrochureSlot = {
      ...slot,
      detached: { owner: cut.owner, from: generated.from, path: [...generated.path] },
    };
    delete plain.generated;
    return [plain];
  });
  return {
    slots,
    sections: record.sections.map((item) => withRepeatKeys(item, keys, "detached")),
    free,
  };
}
