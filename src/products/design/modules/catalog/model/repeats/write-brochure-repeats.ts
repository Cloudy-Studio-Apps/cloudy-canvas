import type { CanvasDocument, ElementPatch } from "@canvas";

import type { BrochureElement } from "../../brochure";
import type { BrochureRepeatsPlan } from "./plan-brochure-repeats.types";

/** Whether a plan writes nothing. */
export function emptyRepeatsPlan(plan: BrochureRepeatsPlan): boolean {
  return (
    plan.slots === null &&
    plan.remove.length === 0 &&
    plan.pages.every(
      (page) => page.add.length === 0 && page.patch.size === 0 && page.remove.length === 0,
    )
  );
}

/**
 * Writes a brochure's repeats plan: new layers (a new page's frame on top of the design page),
 * then the patches in one `updateMany`, the removals, and the record's slots. No checkpoint: it
 * runs inside the edit's undo step. Returns the frames of the pages it added or changed.
 */
export function writeBrochureRepeats(
  doc: CanvasDocument,
  record: BrochureElement,
  plan: BrochureRepeatsPlan,
): string[] {
  const touched: string[] = [];
  const patches = new Map<string, ElementPatch>();
  const remove = [...plan.remove];
  for (const page of plan.pages) {
    if (page.add.length === 0 && page.patch.size === 0 && page.remove.length === 0) continue;
    touched.push(page.rootId);
    for (const node of page.add)
      doc.add(node.parentId === null ? { ...node, index: doc.nextIndex() } : node);
    for (const [id, patch] of page.patch) patches.set(id, patch);
    remove.push(...page.remove);
  }
  if (patches.size > 0) doc.updateMany(patches);
  if (remove.length > 0) doc.remove(remove);
  if (plan.slots) doc.update(record.id, { slots: plan.slots } as ElementPatch<BrochureElement>);
  return touched;
}
