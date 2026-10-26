import { formatName, formatType } from "../../../db";
import type { ErTableOptions } from "./to-tables.types";
import type { ColumnDraft, TableDraft } from "./tables-context.types";

const INDENT = "  ";

/**
 * The tables as DBML: a key (or alternate key) of one column on the column, a longer one as a
 * `[pk]` (or `[unique]`) index.
 */
export function writeDbml(
  tables: readonly TableDraft[],
  existingType: ErTableOptions["existingType"],
): string {
  return tables
    .map((table) => {
      const lines = table.columns.map((column) => columnLine(table, column, existingType));
      const indexes = [
        ...(table.pk.length > 1 ? [`(${table.pk.map(formatName).join(", ")}) [pk]`] : []),
        ...table.uniques
          .filter((group) => group.length > 1)
          .map((group) => `(${group.map(formatName).join(", ")}) [unique]`),
      ];
      if (indexes.length > 0) {
        lines.push(
          `${INDENT}indexes {`,
          ...indexes.map((i) => `${INDENT}${INDENT}${i}`),
          `${INDENT}}`,
        );
      }
      return [`Table ${formatName(table.name)} {`, ...lines, "}"].join("\n");
    })
    .join("\n\n");
}

function columnLine(
  table: TableDraft,
  column: ColumnDraft,
  existingType: ErTableOptions["existingType"],
): string {
  const pk = table.pk.length === 1 && table.pk[0] === column.name;
  const unique =
    column.unique || table.uniques.some((group) => group.length === 1 && group[0] === column.name);
  const settings = [
    ...(pk ? ["pk"] : []),
    ...(column.notNull && !pk ? ["not null"] : []),
    ...(unique && !pk ? ["unique"] : []),
    ...(column.ref
      ? [`ref: > ${formatName(column.ref.table)}.${formatName(column.ref.column)}`]
      : []),
  ];
  // A foreign key has the type of what it points at (as edited in the schema, if it was).
  const type =
    (column.ref && existingType?.(column.ref.table, column.ref.column)) ??
    existingType?.(table.name, column.name) ??
    column.type;
  const tail = settings.length > 0 ? ` [${settings.join(", ")}]` : "";
  return `${INDENT}${formatName(column.name)} ${formatType(type)}${tail}`;
}
