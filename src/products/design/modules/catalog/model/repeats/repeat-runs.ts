import type { BrochureElement } from "../../brochure";
import { repeatTree, slotIdsIn } from "./repeat-tree";
import type { RepeatNode } from "./repeat-tree.types";

/**
 * What each repeat copies, by the repeating section's or slot's id: a section's template slots
 * from its start to the next section at its depth or less, nested subsections included; a page
 * repeat's run is its one slot.
 */
export function repeatRuns(
  record: Pick<BrochureElement, "slots" | "sections">,
): Map<string, string[]> {
  const runs = new Map<string, string[]>();
  const visit = (nodes: readonly RepeatNode[]) => {
    for (const node of nodes) {
      if (node.kind === "slot") {
        if (node.slot.repeat) runs.set(node.slot.id, [node.slot.id]);
        continue;
      }
      if (node.placed.section.repeat) runs.set(node.placed.section.id, slotIdsIn(node.children));
      visit(node.children);
    }
  };
  visit(repeatTree(record));
  return runs;
}
