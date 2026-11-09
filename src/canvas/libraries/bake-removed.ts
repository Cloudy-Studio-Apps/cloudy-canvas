import type { CanvasDocument } from "../document";
import { detachEverywhere } from "../tokens/detach-bindings";
import { deletionRewrites } from "../tokens/token-deletion";
import { withoutOverrides } from "../tokens/token-edits-base";
import { TokenStore } from "../tokens/token-store";
import type { TokenRecord } from "../tokens/token.types";

/**
 * Removes token records from a file the way deleting them does (`deletionRewrites`): the layers
 * using a variable or style keep what it gave them, unlinked, styles and aliases keep its value,
 * the variables of a collection that goes go with it, and those varying by an axis that goes keep
 * their default values. Part of the edit running now (the mirror runs it untracked).
 */
export function bakeRemoved(doc: CanvasDocument, ids: Iterable<string>): void {
  const store = TokenStore.of(doc);
  const gone = new Set([...ids].filter((id) => doc.tokenRecord(id)));
  if (gone.size === 0) return;
  // Variables, generators and scales of a collection that goes, go with it.
  for (const record of doc.tokenRecords()) {
    if ("collectionId" in record && gone.has(record.collectionId)) gone.add(record.id);
  }

  const tokens = [...gone].filter((id) => store.variable(id) ?? store.style(id));
  const writes = new Map<string, TokenRecord>();
  for (const record of deletionRewrites(store, tokens)) {
    if (!gone.has(record.id)) writes.set(record.id, record);
  }
  const axes = new Set([...gone].filter((id) => store.axis(id)));
  if (axes.size > 0) {
    for (const variable of store.variables()) {
      if (gone.has(variable.id) || !variable.axisId || !axes.has(variable.axisId)) continue;
      const base = writes.get(variable.id);
      writes.set(variable.id, withoutOverrides(base?.kind === "variable" ? base : variable));
    }
  }

  doc.batch(() => {
    if (writes.size > 0) doc.setTokenRecords([...writes.values()]);
    if (tokens.length > 0) detachEverywhere(doc, new Set(tokens));
    doc.removeTokenRecords(gone);
  });
}
