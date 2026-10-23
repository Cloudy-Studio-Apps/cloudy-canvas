import type { ErShapes } from "../lang";
import { entityTables } from "./entity-tables";
import { multivaluedTables } from "./multivalued-tables";
import { relationTables } from "./relation-tables";
import { unionTables } from "./union-tables";
import type { ErTableOptions, ErTablesResult } from "./to-tables.types";
import type { TablesContext } from "./tables-context.types";
import { writeDbml } from "./write-dbml";

/**
 * A diagram as relational tables, with the usual mapping rules: entities, then relations,
 * aggregations and associative entities, then the multivalued attributes (see each step). The DBML is what the board's
 * database schema imports, merging by name, so converting again updates the same tables.
 */
export function erToTables(shapes: ErShapes, options: ErTableOptions = {}): ErTablesResult {
  const ctx: TablesContext = {
    shapes,
    options,
    tables: new Map(),
    tableOf: new Map(),
    done: new Set(),
    warnings: [],
  };
  entityTables(ctx);
  unionTables(ctx);
  relationTables(ctx);
  // After the relations, so aggregations' and associative entities' tables have theirs too.
  multivaluedTables(ctx);
  const tables = [...ctx.tables.values()];
  const guessed = tables.some((t) =>
    t.columns.some((c) => !c.ref && options.existingType?.(t.name, c.name) === undefined),
  );
  if (guessed) {
    ctx.warnings.push(
      "Column types were guessed from their names; check them in the database panel.",
    );
  }
  return {
    dbml: writeDbml(tables, options.existingType),
    tables: tables.map((t) => t.name),
    warnings: ctx.warnings,
  };
}
