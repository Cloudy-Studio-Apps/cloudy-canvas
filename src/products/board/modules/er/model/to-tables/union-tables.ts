import { addForeignKey } from "./table-set";
import type { TablesContext } from "./tables-context.types";

/** Union types: each superclass's table points at its category's key (unique, may be empty). */
export function unionTables(ctx: TablesContext): void {
  for (const union of ctx.shapes.unions) {
    const category = ctx.tables.get(ctx.tableOf.get(union.categoryId) ?? "");
    if (!category) continue;
    for (const id of union.superclassIds) {
      const superclass = ctx.tables.get(ctx.tableOf.get(id) ?? "");
      if (superclass) addForeignKey(superclass, category, category.name, { unique: true });
    }
  }
}
