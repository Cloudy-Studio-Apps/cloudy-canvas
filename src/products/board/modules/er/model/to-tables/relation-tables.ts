import type { ErParticipant, ErRelationElement } from "../../relation/relation.types";
import { attributeColumns } from "./attribute-columns";
import { addForeignKey, addOwnColumns, addTable } from "./table-set";
import type { TableDraft, TablesContext } from "./tables-context.types";

/**
 * Relations as foreign keys or tables. A two-way relation with a side that takes part at most once
 * puts a foreign key in that side's table (`[unique]` when both do); the rest (many to many, three
 * or more sides, aggregated ones and associative entities) become link tables, keyed by their
 * "many" sides (an associative entity by its own key, if it has one). Keys point at a
 * participant's join attribute when it has one.
 */
export function relationTables(ctx: TablesContext): void {
  const aggregates = new Map(ctx.shapes.aggregates.map((a) => [a.relationId, a]));
  // Aggregated relations and associative entities first: other relations point at their tables.
  const first = (r: ErRelationElement) => Number(aggregates.has(r.id) || r.associative);
  const ordered = [...ctx.shapes.relations].sort((a, b) => first(b) - first(a));
  for (const relation of ordered) {
    if (ctx.done.has(relation.id)) continue;
    const sides = relation.participants.map((p) => ({ p, table: tableOf(ctx, p) }));
    if (sides.length < 2 || sides.some((s) => !s.table)) {
      ctx.warnings.push(`${relation.name} needs two sides with tables, so it was left out.`);
      continue;
    }
    const resolved = sides as { p: ErParticipant; table: TableDraft }[];
    const aggregate = aggregates.get(relation.id);
    const linked = aggregate !== undefined || relation.associative;
    if (resolved.length === 2 && !linked && foreignKey(ctx, relation, resolved)) continue;
    const table = addTable(ctx, aggregate?.name ?? relation.name);
    const keys: string[] = [];
    const manyKeys: string[] = [];
    for (const side of resolved) {
      const prefix = side.p.role || side.table.name;
      const made = addForeignKey(table, side.table, prefix, {
        notNull: true,
        only: joinColumn(ctx, side.p, side.table),
      });
      keys.push(...made);
      if (side.p.max !== "1") manyKeys.push(...made);
    }
    const own = attributeColumns(ctx, relation.id);
    addOwnColumns(table, own);
    // An associative entity with a key of its own is keyed by it.
    table.pk =
      relation.associative && own.keys.length > 0
        ? own.keys
        : manyKeys.length > 0
          ? manyKeys
          : keys;
    if (relation.associative) ctx.tableOf.set(relation.id, table.name);
    if (aggregate) {
      addOwnColumns(table, attributeColumns(ctx, aggregate.id));
      ctx.tableOf.set(aggregate.id, table.name);
    }
  }
  if (ctx.shapes.constraints.length > 0) {
    ctx.warnings.push(
      "Constraints between relations have no tables; enforce them in the application.",
    );
  }
}

/** A two-way relation as a foreign key, when a side takes part at most once; `false` otherwise. */
function foreignKey(
  ctx: TablesContext,
  relation: ErRelationElement,
  [a, b]: { p: ErParticipant; table: TableDraft }[],
): boolean {
  if (!a || !b) return false;
  const oneA = a.p.max === "1";
  const oneB = b.p.max === "1";
  if (!oneA && !oneB) return false;
  // The side that takes part once holds the key; of two, the mandatory one.
  const holder = oneA && oneB ? (mandatory(a.p.min) || !mandatory(b.p.min) ? a : b) : oneA ? a : b;
  const other = holder === a ? b : a;
  const prefix = holder.table === other.table ? other.p.role || relation.name : other.table.name;
  addForeignKey(holder.table, other.table, prefix, {
    notNull: mandatory(holder.p.min),
    unique: oneA && oneB,
    only: joinColumn(ctx, other.p, other.table),
  });
  addOwnColumns(holder.table, attributeColumns(ctx, relation.id));
  return true;
}

/** The column a participant's join attribute became in its table, if any. */
function joinColumn(ctx: TablesContext, p: ErParticipant, table: TableDraft): string | undefined {
  if (!p.via) return undefined;
  const name = ctx.shapes.attributes.find((a) => a.id === p.via)?.name;
  return name && table.columns.some((c) => c.name === name) ? name : undefined;
}

function tableOf(ctx: TablesContext, p: ErParticipant): TableDraft | undefined {
  return ctx.tables.get(ctx.tableOf.get(p.entityId) ?? "");
}

/** A minimum of at least one. */
function mandatory(min: string): boolean {
  return min !== "" && min !== "0";
}
