import type { CanvasDocument } from "@canvas";

import { PROTOTYPE_FLOW_TYPE } from "../prototype.constants";
import { isFlow } from "./is-flow";
import { nodeInteractions } from "./node-interactions";
import { writeInteractions } from "./write-interactions";

/**
 * After a deletion, in its undo step (an `onRemove`): a flow whose design page or starting screen
 * was deleted goes, and the interactions showing a deleted screen (`to`) leave the nodes that
 * stay.
 */
export function prunePrototype(doc: CanvasDocument, removed: ReadonlySet<string>): void {
  const gone: string[] = [];
  for (const id of doc.ids()) {
    if (removed.has(id)) continue;
    if (doc.field(id, "type") === PROTOTYPE_FLOW_TYPE) {
      const flow = doc.get(id);
      if (isFlow(flow) && (removed.has(flow.page) || removed.has(flow.start))) gone.push(id);
      continue;
    }
    if (!Array.isArray(doc.field(id, "interactions"))) continue;
    const list = nodeInteractions(doc.get(id));
    const kept = list.filter((ix) => ix.to === undefined || !removed.has(ix.to));
    if (kept.length < list.length) writeInteractions(doc, id, kept);
  }
  if (gone.length > 0) doc.remove(gone);
}
