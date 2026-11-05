import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";
import type { BrochureElement, BrochureSlot } from "../../brochure";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * The layers of the brochure's copy frames that `slots` (its slots after the sync) don't list,
 * each frame with everything it holds: copies no longer made, the losing copy when two clients
 * made the same one, a slot lost to a concurrent edit. A copy of a template whose list this
 * device can't read (`unreadable`, template slot ids) is left alone.
 */
export function orphanLayers(
  record: Pick<BrochureElement, "slots">,
  copies: readonly FrameElement[],
  slots: readonly BrochureSlot[],
  unreadable: ReadonlySet<string>,
  children: ReadonlyMap<string, readonly DesignNode[]>,
): string[] {
  const listed = new Set(slots.flatMap((slot) => slot.frames));
  const templateOf = new Map<string, string>();
  for (const slot of record.slots) {
    if (!slot.generated) for (const frame of slot.frames) templateOf.set(frame, slot.id);
  }
  const out: string[] = [];
  for (const copy of copies) {
    if (listed.has(copy.id)) continue;
    const from = templateOf.get(repeatCopyTag(copy)?.source ?? "");
    if (from !== undefined && unreadable.has(from)) continue;
    const queue: string[] = [copy.id];
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      out.push(next);
      queue.push(...(children.get(next) ?? []).map((child) => child.id));
    }
  }
  return out;
}
