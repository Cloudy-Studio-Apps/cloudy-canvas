import type { CanvasElement } from "@canvas";

import { isDbEnum } from "../enum";
import { isDbTable } from "../table";
import type { EnumLink, Relation } from "./relations.types";

/** Every column ref whose target still exists. Dangling refs are skipped. */
export function resolveRelations(shapes: readonly CanvasElement[]): Relation[] {
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

/** Every column whose type names an enum on the board. */
export function resolveEnumLinks(shapes: readonly CanvasElement[]): EnumLink[] {
  const enums = new Map(shapes.filter(isDbEnum).map((target) => [target.name, target]));
  if (enums.size === 0) return [];
  const links: EnumLink[] = [];
  for (const table of shapes.filter(isDbTable)) {
    table.columns.forEach((column, row) => {
      const target = enums.get(column.type);
      if (target) links.push({ table, row, target });
    });
  }
  return links;
}
