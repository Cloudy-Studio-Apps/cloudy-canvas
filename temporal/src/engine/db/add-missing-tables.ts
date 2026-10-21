import type { ColumnType, DbTableShape } from "../document";
import type { ParsedColumn, ParsedEndpoint, ParsedSchema, ParsedTable } from "./dbml";

const DEFAULT_TYPE: ColumnType = { type: "integer", typeArgs: "" };

/**
 * Adds a table for every ref end that names a table neither the text nor `others` defines. It gets
 * the columns the refs use, typed like the column at the other end. A warning reports each one.
 */
export function addMissingTables(
  schema: ParsedSchema,
  others: readonly DbTableShape[],
): ParsedSchema {
  const known = new Map<string, DbTableShape | ParsedTable>();
  for (const table of others) known.set(table.name, table);
  for (const table of schema.tables) {
    known.set(table.name, table);
    if (table.alias) known.set(table.alias, table);
  }

  const created = new Map<string, ParsedTable>();
  const addColumn = (endpoint: ParsedEndpoint, other: ParsedEndpoint, line: number) => {
    if (known.has(endpoint.table)) return;
    let table = created.get(endpoint.table);
    if (!table) {
      table = {
        name: endpoint.table,
        alias: null,
        headerColor: null,
        note: "",
        columns: [],
        indexes: [],
        line,
      };
      created.set(endpoint.table, table);
    }
    if (table.columns.some((column) => column.name === endpoint.column)) return;
    table.columns.push(stubColumn(endpoint.column, typeOf(other) ?? DEFAULT_TYPE));
  };
  const typeOf = (endpoint: ParsedEndpoint): ColumnType | undefined =>
    (known.get(endpoint.table) ?? created.get(endpoint.table))?.columns.find(
      (column) => column.name === endpoint.column,
    );

  for (const ref of schema.refs) {
    addColumn(ref.from, ref.to, ref.line);
    addColumn(ref.to, ref.from, ref.line);
  }
  if (created.size === 0) return schema;

  const tables = [...created.values()];
  return {
    ...schema,
    tables: [...schema.tables, ...tables],
    warnings: [
      ...schema.warnings,
      ...tables.map((table) => ({
        message: `Created the missing table "${table.name}"`,
        line: table.line,
        column: 1,
      })),
    ],
  };
}

function stubColumn(name: string, { type, typeArgs }: ColumnType): ParsedColumn {
  return {
    name,
    type,
    typeArgs,
    pk: name === "id",
    increment: false,
    notNull: false,
    unique: false,
    default: null,
    note: "",
  };
}
