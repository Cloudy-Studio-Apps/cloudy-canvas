import type { CanvasDocument } from "@canvas";

import { isDbTable } from "../table";
import { patchTable } from "./patch-db-element";

/** Clears refs whose target table or column no longer exists. Call inside a batch. */
export function pruneRefs(doc: CanvasDocument): void {
  const tables = doc.all().filter(isDbTable);
  const columns = new Set(tables.flatMap((t) => t.columns.map((c) => `${t.id}/${c.id}`)));
  const dangling = (ref: { tableId: string; columnId: string } | null) =>
    ref !== null && !columns.has(`${ref.tableId}/${ref.columnId}`);

  for (const table of tables) {
    if (!table.columns.some((c) => dangling(c.ref))) continue;
    patchTable(doc, table.id, {
      columns: table.columns.map((c) => (dangling(c.ref) ? { ...c, ref: null } : c)),
    });
  }
}
