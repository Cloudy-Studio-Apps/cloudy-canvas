import {
  DB_HEADER_COLORS,
  formatColumnType,
  type DbColumn,
  type DbIndex,
  type DbTableShape,
} from "../../document";
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

  const indexes = table.indexes.map((index) => serializeIndex(index, table)).filter(Boolean);
  if (indexes.length > 0) {
    lines.push("", `${INDENT}indexes {`);
    for (const index of indexes) lines.push(INDENT + INDENT + index);
    lines.push(`${INDENT}}`);
  }
  if (table.note) {
    if (table.columns.length > 0) lines.push("");
    lines.push(`${INDENT}Note: ${formatString(table.note)}`);
  }
  lines.push("}");
  return lines.join("\n");
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

  const head = `${formatName(column.name)} ${formatType(formatColumnType(column))}`;
  return settings.length ? `${head} [${settings.join(", ")}]` : head;
}

/** `col`, `` `expr` `` or `(a, b)` plus settings; empty when none of its columns exist any more. */
function serializeIndex(index: DbIndex, table: DbTableShape): string {
  const parts = index.parts.flatMap((part) => {
    if (part.kind === "expr") return [`\`${part.expr}\``];
    const column = table.columns.find((c) => c.id === part.columnId);
    return column ? [formatName(column.name)] : [];
  });
  if (parts.length === 0) return "";
  const head = parts.length === 1 ? parts[0]! : `(${parts.join(", ")})`;

  const settings: string[] = [];
  if (index.pk) settings.push("pk");
  if (index.unique) settings.push("unique");
  if (index.name) settings.push(`name: ${formatString(index.name)}`);
  if (index.type) settings.push(`type: ${index.type}`);
  if (index.note) settings.push(`note: ${formatString(index.note)}`);
  return settings.length ? `${head} [${settings.join(", ")}]` : head;
}
