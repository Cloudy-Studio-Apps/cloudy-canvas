import type { ScopeLayer } from "../../../data";
import type { BrochureElement } from "../../brochure";
import type { BrochureExpansion } from "./expand-brochure.types";
import type { RepeatTarget } from "./repeat-edits.types";
import { repeatTree, slotIdsIn } from "./repeat-tree";
import type { RepeatNode } from "./repeat-tree.types";

/** The node a target names in the tree, with the repeating sections around it. */
function find(
  nodes: readonly RepeatNode[],
  id: string,
  around: readonly string[],
): { node: RepeatNode; around: readonly string[] } | null {
  for (const node of nodes) {
    const own = node.kind === "slot" ? node.slot.id : node.placed.section.id;
    if (own === id) return { node, around };
    if (node.kind !== "section") continue;
    const inner = node.placed.section.repeat ? [...around, own] : around;
    const found = find(node.children, id, inner);
    if (found) return found;
  }
  return null;
}

/**
 * The loops around a section or page (not its own, nor any inside it), outermost first: the rows
 * its template pages read from the repeating sections it's in, at their preview rows. Read from
 * its first template page in `expansion`; `[]` when it has none. A list it repeats over is read in
 * their scope (`layeredScope`). Pure.
 */
export function loopsAround(
  record: Pick<BrochureElement, "slots" | "sections" | "settings">,
  expansion: BrochureExpansion,
  target: RepeatTarget,
): ScopeLayer[] {
  const id = "section" in target ? target.section : target.slot;
  const found = find(repeatTree(record), id, []);
  if (!found) return [];
  const first = found.node.kind === "slot" ? found.node.slot.id : slotIdsIn(found.node.children)[0];
  const page = expansion.pages.find((item) => item.id === first);
  const around = new Set(found.around);
  return (page?.layers ?? []).filter((layer) => around.has(layer.owner));
}
