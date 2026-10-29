import { CodeWriter } from "../../code";
import type { CodeColumn, CodeEnum, CodeRelation, CodeTable } from "../../model";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import type { SqlDialect } from "./sql-dialect.types";

const INTEGER_TYPES = new Set(["integer", "bigint", "smallint"]);

/** One `CREATE TABLE`, with the foreign keys in `inline`. Warnings go into `warnings`. */
export function writeTable(
  table: CodeTable,
  dialect: SqlDialect,
  enums: readonly CodeEnum[],
  inline: readonly CodeRelation[],
  warnings: CodeWarning[],
): string {
  const { id } = dialect;
  const lines = [
    ...table.columns.map((column) => columnLine(table, column, dialect, enums, warnings)),
    ...(table.primaryKey.length > 0
      ? [`PRIMARY KEY (${table.primaryKey.map(id).join(", ")})`]
      : []),
    ...inline.map((relation) => foreignKey(relation, dialect)),
  ];
  const writer = new CodeWriter("  ");
  writer.line(`CREATE TABLE ${id(table.name)} (`);
  writer.indent(() =>
    lines.forEach((line, i) => writer.line(i < lines.length - 1 ? `${line},` : line)),
  );
  writer.line(`)${dialect.tableSuffix(table)};`);
  return writer.toString();
}

/** `FOREIGN KEY (a) REFERENCES t (b)`. */
export function foreignKey(relation: CodeRelation, dialect: SqlDialect): string {
  const { id } = dialect;
  return (
    `FOREIGN KEY (${id(relation.from.column)}) ` +
    `REFERENCES ${id(relation.to.table)} (${id(relation.to.column)})`
  );
}

function columnLine(
  table: CodeTable,
  column: CodeColumn,
  dialect: SqlDialect,
  enums: readonly CodeEnum[],
  warnings: CodeWarning[],
): string {
  let type = dialect.columnType(column, enums);
  if (type === null) {
    type = dialect.fallbackType;
    warnings.push(
      warn(
        "unknown-type",
        {
          table: table.name,
          column: column.name,
          type: column.type,
          target: dialect.name,
          fallback: type,
        },
        { table: table.name, column: column.name },
      ),
    );
  }
  const parts = [dialect.id(column.name), type];
  if (column.increment) {
    if (INTEGER_TYPES.has(column.type) && !column.array) parts.push(dialect.increment);
    else {
      warnings.push(
        warn(
          "unsupported-increment",
          { table: table.name, column: column.name, target: dialect.name },
          { table: table.name, column: column.name },
        ),
      );
    }
  }
  if (column.notNull && !column.pk) parts.push("NOT NULL");
  if (column.unique && !column.pk) parts.push("UNIQUE");
  if (column.default) parts.push(`DEFAULT ${dialect.defaultValue(column.default, column)}`);
  const comment = column.note ? dialect.columnComment(column.note) : null;
  if (comment) parts.push(comment);
  return parts.join(" ");
}
