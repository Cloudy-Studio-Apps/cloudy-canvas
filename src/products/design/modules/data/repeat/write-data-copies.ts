import type { CanvasDocument, ElementPatch } from "@canvas";

import type { DataCopyPlan } from "./plan-data-copies.types";

/**
 * Writes an iterator's copy plan: each new layer added (parents before their children, as the
 * plan lists them; the plan's nodes are handed over as they are, never changed), then the kept
 * layers' patches (a reparenting included) and their new order in one `updateMany`, then the
 * removals, which never hold a kept layer. No checkpoint: it runs inside the edit's undo step.
 */
export function writeDataCopies(doc: CanvasDocument, plan: DataCopyPlan): void {
  for (const entry of plan.add) for (const node of entry.nodes) doc.add(node);
  const patches = new Map<string, ElementPatch>();
  for (const { id, patch } of plan.patch) patches.set(id, patch as ElementPatch);
  for (const { id, index } of plan.order) {
    patches.set(id, { ...patches.get(id), index });
  }
  if (patches.size > 0) doc.updateMany(patches);
  if (plan.remove.length > 0) doc.remove(plan.remove);
}

/** Whether a plan writes nothing. */
export function emptyCopyPlan(plan: DataCopyPlan): boolean {
  return (
    plan.add.length === 0 &&
    plan.patch.length === 0 &&
    plan.order.length === 0 &&
    plan.remove.length === 0
  );
}
