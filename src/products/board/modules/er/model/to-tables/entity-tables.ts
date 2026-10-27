import type { ErEntityElement } from "../../entity/entity.types";
import type { ErIsaElement } from "../../isa/isa.types";
import { attributeColumns, ownAttributes } from "./attribute-columns";
import { addColumn, addForeignKey, addOwnColumns, addTable } from "./table-set";
import type { TablesContext } from "./tables-context.types";
import { t } from "../../er.i18n";

/**
 * Entities as tables. A strong entity's keys are its primary key (an `id` is added when it has
 * none). A hierarchy's children either get tables keyed by their parent's key (`per-entity`) or
 * go into the parent's table with a discriminator column (`single`). A weak entity's key is its
 * owners' keys plus its partial key; its identifying relations need no table of their own.
 */
export function entityTables(ctx: TablesContext): void {
  const isaOf = new Map<string, ErIsaElement>();
  for (const isa of ctx.shapes.isas) for (const c of isa.children) isaOf.set(c.entityId, isa);
  const weak = ctx.shapes.entities.filter((e) => e.weak && ownersOf(ctx, e).length > 0);
  const strong = ctx.shapes.entities.filter((e) => !weak.includes(e));
  for (const entity of parentsFirst(strong, isaOf)) strongTable(ctx, entity, isaOf.get(entity.id));
  weakTables(ctx, weak);
}

function strongTable(ctx: TablesContext, entity: ErEntityElement, isa?: ErIsaElement): void {
  const parentName = isa ? ctx.tableOf.get(isa.parentId) : undefined;
  const parent = parentName ? ctx.tables.get(parentName) : undefined;
  const own = attributeColumns(ctx, entity.id);
  if (isa && parent && (ctx.options.hierarchies?.[isa.id] ?? "per-entity") === "single") {
    // Into the parent's table: its columns can be empty for the other children.
    addOwnColumns(parent, own);
    const discriminator = ownAttributes(ctx, isa.id)[0]?.name ?? "tipo";
    if (!parent.columns.some((c) => c.name === discriminator)) {
      addColumn(parent, { name: discriminator, type: "varchar" });
    }
    ctx.tableOf.set(entity.id, parent.name);
    return;
  }
  const table = addTable(ctx, entity.name);
  ctx.tableOf.set(entity.id, table.name);
  if (parent) {
    // A child is keyed by its parent's key, which points at the parent too.
    for (const key of parent.pk) {
      const type = parent.columns.find((c) => c.name === key)?.type ?? "integer";
      table.pk.push(
        addColumn(table, { name: key, type, ref: { table: parent.name, column: key } }),
      );
    }
    addOwnColumns(table, own);
    return;
  }
  addOwnColumns(table, own);
  table.pk = own.keys;
  if (table.pk.length === 0) {
    // A union type's category is keyed by a surrogate its superclasses point at.
    const category = ctx.shapes.unions.some((u) => u.categoryId === entity.id);
    const key = category ? `${entity.name}_id` : "id";
    table.columns.unshift({ name: key, type: "integer" });
    table.pk = [key];
    if (!category) ctx.warnings.push(t("toTables.warnNoKey", { name: entity.name }));
  }
}

/** Weak entities once their owners have tables (owners may be weak themselves). */
function weakTables(ctx: TablesContext, weak: readonly ErEntityElement[]): void {
  let left = [...weak];
  while (left.length > 0) {
    const ready = left.filter((e) => ownersOf(ctx, e).every((o) => ctx.tableOf.has(o.owner)));
    if (ready.length === 0) break;
    for (const entity of ready) weakTable(ctx, entity);
    left = left.filter((e) => !ready.includes(e));
  }
  for (const entity of left) {
    ctx.warnings.push(t("toTables.warnLoop", { name: entity.name }));
    strongTable(ctx, entity);
  }
}

function weakTable(ctx: TablesContext, entity: ErEntityElement): void {
  const table = addTable(ctx, entity.name);
  ctx.tableOf.set(entity.id, table.name);
  for (const { owner, relationId } of ownersOf(ctx, entity)) {
    const target = ctx.tables.get(ctx.tableOf.get(owner) ?? "");
    if (!target) continue;
    table.pk.push(...addForeignKey(table, target, target.name, { notNull: true }));
    ctx.done.add(relationId);
    // The identifying relation's attributes describe the weak entity.
    addOwnColumns(table, attributeColumns(ctx, relationId));
  }
  const own = attributeColumns(ctx, entity.id);
  addOwnColumns(table, own);
  if (own.partialKeys.length === 0 && own.keys.length === 0) {
    ctx.warnings.push(t("toTables.warnNoPartial", { name: entity.name }));
  }
  table.pk.push(...own.partialKeys, ...own.keys);
}

/** The entities a weak entity depends on: the other sides of its identifying relations. */
function ownersOf(ctx: TablesContext, entity: ErEntityElement) {
  return ctx.shapes.relations
    .filter(
      (r) => (r.identifying || r.idMark) && r.participants.some((p) => p.entityId === entity.id),
    )
    .flatMap((r) =>
      r.participants
        .filter((p) => p.entityId !== entity.id)
        .map((p) => ({ owner: p.entityId, relationId: r.id })),
    );
}

/** Entities with hierarchy parents before their children. */
function parentsFirst(
  entities: readonly ErEntityElement[],
  isaOf: ReadonlyMap<string, ErIsaElement>,
): ErEntityElement[] {
  const depth = (id: string, seen = new Set<string>()): number => {
    const isa = isaOf.get(id);
    if (!isa || seen.has(id)) return 0;
    seen.add(id);
    return 1 + depth(isa.parentId, seen);
  };
  return [...entities].sort((a, b) => depth(a.id) - depth(b.id));
}
