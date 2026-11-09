import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDataSource } from "../source";
import { clearSecrets } from "./write-secrets";
import { sharedState } from "./shared-state";

/**
 * After a deletion that didn't go through the service (an agent's `nodes_delete`, an `onRemove`):
 * forgets the removed sources' Update state and deletes what they kept on this device (secrets,
 * their origin, file paths) when an editor is open. Undo brings a record back, not its secrets.
 */
export function forgetRemovedSources(
  doc: CanvasDocument,
  removed: ReadonlySet<string>,
  before: readonly CanvasElement[],
): void {
  const state = sharedState(doc);
  for (const el of before) {
    if (!removed.has(el.id) || !isDataSource(el)) continue;
    state.updates.forget(el.id);
    const context = state.context;
    if (!context) continue;
    const specs = context.types.find((t) => t.id === el.sourceType)?.settings ?? [];
    void clearSecrets(context.services, el.id, specs, el.settings).catch((error: unknown) => {
      console.warn(`Couldn't delete the secrets of data source ${el.id}.`, error);
    });
  }
}
