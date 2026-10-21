import { DB_HEADER_COLORS, type DbColumn, type DbTableShape } from "../../document";
import { formatName, formatString, formatType } from "./dbml-format";

const INDENT = "  ";

/** One table as canonical DBML, with its outgoing relations written as inline `ref:` settings. */
export function serializeTable(
  table: DbTableShape,
  tablesById: ReadonlyMap<string, DbTableShape>,
): string {
  const settings =
    table.headerColor !== DB_HEADER_COLORS[0].value ? ` [headercolor: ${table.headerColor}]` : "";
  const lines = [`Table ${formatName(table.name)}${settings} {`];
  for (const column of table.columns) lines.push(INDENT + serializeColumn(column, tablesById));
  if (table.note) {
    if (table.columns.length > 0) lines.push("");
    lines.push(`${INDENT}Note: ${formatString(table.note)}`);
  }
  lines.push("}");
  return lines.join("\n");
}

/** The whole board schema. */
export function serializeSchema(tables: readonly DbTableShape[]): string {
  const byId = new Map(tables.map((table) => [table.id, table]));
  return (
    tables.map((table) => serializeTable(table, byId)).join("\n\n") + (tables.length ? "\n" : "")
  );
}

function serializeColumn(column: DbColumn, tablesById: ReadonlyMap<string, DbTableShape>): string {
  const settings: string[] = [];
  if (column.pk) settings.push("pk");
  if (column.increment) settings.push("increment");
  if (column.notNull) settings.push("not null");
  if (column.unique) settings.push("unique");
  if (column.default !== null) settings.push(`default: ${column.default}`);
  if (column.note) settings.push(`note: ${formatString(column.note)}`);

  const target = column.ref && tablesById.get(column.ref.tableId);
  const targetColumn = target?.columns.find((c) => c.id === column.ref!.columnId);
  if (column.ref && target && targetColumn) {
    settings.push(
      `ref: ${column.ref.kind} ${formatName(target.name)}.${formatName(targetColumn.name)}`,
    );
  }

  const head = `${formatName(column.name)} ${formatType(column.type)}`;
  return settings.length ? `${head} [${settings.join(", ")}]` : head;
}
