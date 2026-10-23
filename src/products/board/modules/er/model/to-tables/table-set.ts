import type {
  AttributeColumns,
  ColumnDraft,
  ForeignKeyOptions,
  TableDraft,
  TablesContext,
} from "./tables-context.types";

/** A new table named `base` (or `base_2`… when taken). */
export function addTable(ctx: TablesContext, base: string): TableDraft {
  let name = base;
  for (let n = 2; ctx.tables.has(name); n++) name = `${base}_${n}`;
  const table: TableDraft = { name, columns: [], pk: [], uniques: [] };
  ctx.tables.set(name, table);
  return table;
}

/** Adds a column (renamed `name_2`… when the table already has one by that name); returns its name. */
export function addColumn(table: TableDraft, column: ColumnDraft): string {
  let name = column.name;
  for (let n = 2; table.columns.some((c) => c.name === name); n++) name = `${column.name}_${n}`;
  table.columns.push({ ...column, name });
  return name;
}

/**
 * Columns in `into` pointing at `target`'s key (or at `only`, a column of it), named
 * `<prefix>_<column>`; returns their names.
 */
export function addForeignKey(
  into: TableDraft,
  target: TableDraft,
  prefix: string,
  options: ForeignKeyOptions = {},
): string[] {
  const columns = options.only ? [options.only] : target.pk;
  return columns.map((column) => {
    const source = target.columns.find((c) => c.name === column);
    // A key already named after its table (`Propietario_id`) isn't prefixed twice.
    const name = column.startsWith(`${prefix}_`) ? column : `${prefix}_${column}`;
    return addColumn(into, {
      name,
      type: source?.type ?? "integer",
      ref: { table: target.name, column },
      ...(options.notNull ? { notNull: true } : {}),
      ...(options.unique ? { unique: true } : {}),
    });
  });
}

/** Adds attribute columns to a table, with their alternate keys as unique groups. */
export function addOwnColumns(table: TableDraft, made: AttributeColumns): void {
  const renamed = new Map(made.columns.map((column) => [column.name, addColumn(table, column)]));
  for (const group of made.alternates) {
    table.uniques.push(group.map((name) => renamed.get(name) ?? name));
  }
}
