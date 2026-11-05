import type { BrochureElement, BrochureSlot } from "../../brochure";
import { segmentOwner } from "./copy-segment";
import { expandedId } from "./expanded-id";
import { addKey, withRepeatKeys } from "./repeat-keys";
import type { DetachEdit } from "./detach-generated.types";

/**
 * Takes single pages a repeat made (`copies`, generated slots, in `record.slots` or just left out
 * of them) out of their repeats by hand: each page's id (`expandedId`) joins its loop's
 * `detachedPages` (the innermost loop of its path), so the sync never makes that page again while
 * the rest of its copy is still made. Those still in the record stay as plain pages in the copy's
 * place (`detached`, no `generated`; `expandBrochure` puts each where its page was), except the
 * slots in `drop`, which go. Every copy's frames are listed in `free`. Pure.
 */
export function detachPages(
  record: Pick<BrochureElement, "slots" | "sections">,
  copies: readonly BrochureSlot[],
  drop: ReadonlySet<string> = new Set(),
): DetachEdit {
  const keys = new Map<string, string[]>();
  const taken = new Map<string, BrochureSlot["detached"]>();
  for (const slot of copies) {
    const generated = slot.generated;
    const last = generated?.path[generated.path.length - 1];
    if (!generated || last === undefined) continue;
    const owner = segmentOwner(last);
    addKey(keys, owner, expandedId(generated.from, generated.path));
    taken.set(slot.id, { owner, from: generated.from, path: [...generated.path] });
  }
  const slots = record.slots.flatMap((slot): BrochureSlot[] => {
    const detached = taken.get(slot.id);
    if (!detached) return [withRepeatKeys(slot, keys, "detachedPages")];
    if (drop.has(slot.id)) return [];
    const plain: BrochureSlot = { ...slot, detached };
    delete plain.generated;
    return [plain];
  });
  return {
    slots,
    sections: record.sections.map((item) => withRepeatKeys(item, keys, "detachedPages")),
    free: copies.filter((slot) => taken.has(slot.id)).flatMap((slot) => slot.frames),
  };
}
