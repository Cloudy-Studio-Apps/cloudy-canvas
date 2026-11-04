import type { CanvasDocument } from "@canvas";

import type { SharedState } from "./shared-state.types";
import { SourceUpdates } from "./source-updates";

const SHARED = new WeakMap<object, SharedState>();

/** The data sources' state shared by every view of this document's Yjs doc. */
export function sharedState(doc: CanvasDocument): SharedState {
  let state = SHARED.get(doc.doc);
  if (!state) {
    state = { context: null, updates: new SourceUpdates() };
    SHARED.set(doc.doc, state);
  }
  return state;
}
