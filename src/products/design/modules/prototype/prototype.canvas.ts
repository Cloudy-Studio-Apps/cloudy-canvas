import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";
import { PrototypeFlowKind, prunePrototype } from "./model";

/**
 * The prototype's canvas side: the flow records and their pruning. Copies need no hook: the
 * clipboard's `remapIds` already points a copied link at its copied screen.
 */
export function registerPrototypeCanvas(host: ModuleHost): void {
  host.contribute(designCanvas.kinds, new PrototypeFlowKind());
  // Links to deleted screens go, and the flows that started at them or were on a deleted page,
  // in the same undo step.
  host.contribute(designCanvas.onRemove, (doc, removed) => prunePrototype(doc, removed));
}
