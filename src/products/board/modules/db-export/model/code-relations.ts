import type { DbRef, DbTableElement } from "../../db";
import type { CodeRelation } from "./code-schema.types";

/**
 * The relation a column's ref describes, written from the foreign key side: `>` and `-` keep the
 * column as the foreign key, `<` puts it on the other end, `<>` is many to many. `null` when the
 * ref points at a table or column that no longer exists.
 */
export function codeRelation(
  table: DbTableElement,
  column: string,
  ref: DbRef,
  tableOf: (id: string) => DbTableElement | undefined,
  exported: ReadonlySet<string>,
): CodeRelation | null {
  const target = tableOf(ref.tableId);
  const targetColumn = target?.columns.find((c) => c.id === ref.columnId);
  if (!target || !targetColumn) return null;
  const here = { table: table.name, column };
  const there = { table: target.name, column: targetColumn.name };
  const external = !exported.has(table.id) || !exported.has(target.id);
  switch (ref.kind) {
    case ">":
      return { from: here, to: there, kind: "many-to-one", external };
    case "<":
      return { from: there, to: here, kind: "many-to-one", external };
    case "-":
      return { from: here, to: there, kind: "one-to-one", external };
    case "<>":
      return { from: here, to: there, kind: "many-to-many", external };
  }
}
