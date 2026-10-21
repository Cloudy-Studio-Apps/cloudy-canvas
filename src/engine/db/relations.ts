import { isDbTable, type Shape } from "../document";
import type { Relation } from "./relations.types";

/** Every column ref whose target still exists. Dangling refs are skipped. */
export function resolveRelations(shapes: readonly Shape[]): Relation[] {
  const tables = new Map(shapes.filter(isDbTable).map((table) => [table.id, table]));
  const relations: Relation[] = [];
  for (const from of tables.values()) {
    from.columns.forEach((column, fromRow) => {
      if (!column.ref) return;
      const to = tables.get(column.ref.tableId);
      const toRow = to?.columns.findIndex((c) => c.id === column.ref!.columnId) ?? -1;
      if (to && toRow >= 0) relations.push({ from, fromRow, to, toRow, kind: column.ref.kind });
    });
  }
  return relations;
}
