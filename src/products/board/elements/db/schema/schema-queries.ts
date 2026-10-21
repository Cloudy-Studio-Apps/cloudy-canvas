import { formatColumnType, type DbTableElement } from "../table";
import type { DbEnumElement } from "../enum";
import type { ColumnTarget, EnumUsage, IncomingRef } from "./db-schema.types";

/** Columns of any table that point at `target`. */
export function incomingRefs(
  target: DbTableElement,
  tables: readonly DbTableElement[],
): IncomingRef[] {
  const result: IncomingRef[] = [];
  for (const table of tables) {
    for (const column of table.columns) {
      if (column.ref?.tableId !== target.id) continue;
      const targetColumn = target.columns.find((c) => c.id === column.ref!.columnId);
      if (targetColumn) result.push({ table, column, target: targetColumn, ref: column.ref });
    }
  }
  return result;
}

/** Every column on the board, for the relation picker. */
export function columnTargets(tables: readonly DbTableElement[]): ColumnTarget[] {
  return tables.flatMap((table) =>
    table.columns.map((column) => ({
      tableId: table.id,
      tableName: table.name,
      columnId: column.id,
      columnName: column.name,
      type: formatColumnType(column),
      pk: column.pk,
    })),
  );
}

/** Columns typed with the enum. */
export function enumUsages(target: DbEnumElement, tables: readonly DbTableElement[]): EnumUsage[] {
  return tables.flatMap((table) =>
    table.columns.filter((c) => c.type === target.name).map((column) => ({ table, column })),
  );
}
