import type { ColumnDraft, TableDraft } from "../../../../model";
import type { TableCardRow, TableKey } from "./table-card.types";

/** How a column shows as a `TableCard` row; whatever `pick` returns goes on top. */
export function tableRows(
  table: TableDraft,
  prefix: string,
  pick: (column: ColumnDraft) => Partial<TableCardRow> = () => ({}),
): TableCardRow[] {
  return table.columns.map((column) => ({
    id: `${prefix}:${column.name}`,
    name: column.name,
    key: columnKey(table, column),
    ...pick(column),
  }));
}

function columnKey(table: TableDraft, column: ColumnDraft): TableKey {
  if (table.pk.includes(column.name)) return "own";
  return column.ref ? "link" : null;
}
