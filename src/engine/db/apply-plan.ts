import type { BoardDocument, ShapePatch } from "../document";
import { placeNewTables } from "./place-new-tables";
import { pruneRefs } from "./prune-refs";
import type { ReconcilePlan } from "./reconcile.types";

/** Writes a reconcile plan as one undo step. New tables are placed next to the existing content. */
export function applyPlan(doc: BoardDocument, { tables, added, removed }: ReconcilePlan): void {
  const newTables = tables.filter((table) => added.has(table.id));
  const positions = placeNewTables(doc, newTables, new Set(removed));
  doc.checkpoint();
  doc.batch(() => {
    if (removed.length) doc.remove(removed);
    for (const table of tables) {
      if (added.has(table.id)) continue;
      const { name, headerColor, note, columns, w, h } = table;
      doc.update(table.id, { name, headerColor, note, columns, w, h } satisfies ShapePatch);
    }
    newTables.forEach((table, i) => {
      doc.add({ ...table, ...positions[i]!, index: doc.nextIndex() });
    });
    pruneRefs(doc);
  });
}
