import type { BrochureElement, BrochureSlot } from "../../brochure";
import { backCoverSlot } from "../back-cover-slot";
import { placeSections, sectionWithChildren } from "../sections";
import type { PlacedSection } from "../sections";
import type { RepeatNode } from "./repeat-tree.types";

/**
 * The slots the user placed: every slot but the copies repeats made and the copies taken out of
 * them (`detached`, plain pages outside every run, `placeDetached`).
 */
export function templateSlots(record: Pick<BrochureElement, "slots">): BrochureSlot[] {
  return record.slots.filter((slot) => !slot.generated && !slot.detached);
}

/** Where a placed section's pages end: the next section at its depth or less, else the last slot. */
function sectionEnd(placed: readonly PlacedSection[], at: number, slotCount: number): number {
  const id = placed[at]?.section.id;
  if (id === undefined) return slotCount;
  const block = sectionWithChildren(placed, id);
  return placed[at + block.length]?.position ?? slotCount;
}

/**
 * A brochure's template slots as a tree: each section holds the pages from its start to the next
 * section at its depth or less, its subsections nested (`placeSections`). A repeating section also
 * ends before the back cover (`backCoverSlot`), so the closing page prints once; a subsection
 * starting there then reads as in the section around the repeating one. Copies (`generated`) and
 * copies taken out of a repeat (`detached`) are left out.
 */
export function repeatTree(
  record: Pick<BrochureElement, "slots" | "sections" | "settings">,
): RepeatNode[] {
  const slots = templateSlots(record);
  const placed = placeSections(record.sections, slots);
  const back = backCoverSlot(slots, record.settings) ? slots.length - 1 : slots.length;
  const ends = placed.map((item, at) => {
    const end = sectionEnd(placed, at, slots.length);
    return item.section.repeat ? Math.min(end, Math.max(back, item.position + 1)) : end;
  });
  const byId = new Map(placed.map((item, at) => [item.section.id, at]));
  // A section starting at or after where its parent ends reads as in the parent's parent.
  const parentOf = placed.map((item) => {
    let parent = item.parent;
    for (;;) {
      const at = parent === null ? undefined : byId.get(parent);
      if (at === undefined || item.position < (ends[at] ?? slots.length)) return parent;
      parent = placed[at]?.parent ?? null;
    }
  });

  const build = (from: number, to: number, parent: string | null): RepeatNode[] => {
    const kids = placed
      .map((item, at) => ({ item, at }))
      .filter(
        ({ item, at }) => parentOf[at] === parent && item.position >= from && item.position < to,
      );
    const out: RepeatNode[] = [];
    let p = from;
    let k = 0;
    for (;;) {
      const next = kids[k];
      if (next && next.item.position <= p) {
        const end = Math.min(ends[next.at] ?? to, to);
        out.push({
          kind: "section",
          placed: next.item,
          children: build(next.item.position, end, next.item.section.id),
        });
        p = Math.max(p, end);
        k++;
        continue;
      }
      const slot = slots[p];
      if (p >= to || !slot) break;
      out.push({ kind: "slot", slot });
      p++;
    }
    return out;
  };

  return build(0, slots.length, null);
}

/** The template slot ids inside nodes, in order. */
export function slotIdsIn(nodes: readonly RepeatNode[]): string[] {
  return nodes.flatMap((node) =>
    node.kind === "slot" ? [node.slot.id] : slotIdsIn(node.children),
  );
}
