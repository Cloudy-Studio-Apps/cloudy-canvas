import type { BrochureElement, BrochureSlot } from "../../brochure";
import { placeSections, sectionWithChildren } from "../sections";
import type { PlacedSection } from "../sections";
import type { RepeatNode } from "./repeat-tree.types";

/** The slots the user placed: every slot but the copies repeats made. */
export function templateSlots(record: Pick<BrochureElement, "slots">): BrochureSlot[] {
  return record.slots.filter((slot) => !slot.generated);
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
 * section at its depth or less, its subsections nested (`placeSections`). Copies (`generated`) are
 * left out.
 */
export function repeatTree(record: Pick<BrochureElement, "slots" | "sections">): RepeatNode[] {
  const slots = templateSlots(record);
  const placed = placeSections(record.sections, slots);
  const ends = placed.map((_, at) => sectionEnd(placed, at, slots.length));

  const build = (from: number, to: number, parent: string | null): RepeatNode[] => {
    const kids = placed
      .map((item, at) => ({ item, at }))
      .filter(({ item }) => item.parent === parent && item.position >= from && item.position < to);
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
