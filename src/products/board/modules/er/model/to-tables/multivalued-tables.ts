import { attributeColumns, ownAttributes } from "./attribute-columns";
import { addColumn, addForeignKey, addTable } from "./table-set";
import type { TablesContext } from "./tables-context.types";

/** A table per multivalued attribute: its owner's key and the values, keyed by both. */
export function multivaluedTables(ctx: TablesContext): void {
  for (const [ownerId, ownerName] of [...ctx.tableOf]) {
    const owner = ctx.tables.get(ownerName);
    if (!owner) continue;
    for (const attribute of ownAttributes(ctx, ownerId).filter((a) => a.multivalued)) {
      const table = addTable(ctx, `${owner.name}_${attribute.name}`);
      const keys = addForeignKey(table, owner, owner.name, { notNull: true });
      const parts = attributeColumns(ctx, attribute.id, `${attribute.name}_`).columns;
      const values = parts.length > 0 ? parts : [{ name: attribute.name, type: "varchar" }];
      table.pk = [...keys, ...values.map((column) => addColumn(table, column))];
    }
  }
}
