import type { CodeRelation, CodeTable } from "./code-schema.types";
import type { DependencyOrder } from "./dependency-order.types";

/**
 * Tables in foreign key order: each after the tables it references (self-references and external
 * ones don't count), ties in their given order. A cycle is broken by deferring the foreign key
 * that closes it, and ordering goes on.
 */
export function dependencyOrder(tables: readonly CodeTable[]): DependencyOrder {
  const byName = new Map(tables.map((table) => [table.name, table]));
  const deferred: CodeRelation[] = [];
  const counts = (table: CodeTable) => (relation: CodeRelation) =>
    !relation.external &&
    relation.to.table !== table.name &&
    byName.has(relation.to.table) &&
    !deferred.includes(relation);

  const order: CodeTable[] = [];
  const placed = new Set<string>();
  const waiting = [...tables];
  while (waiting.length > 0) {
    const ready = waiting.findIndex((table) =>
      table.outgoing.filter(counts(table)).every((relation) => placed.has(relation.to.table)),
    );
    if (ready === -1) {
      const closing = closingRelation(waiting, (table) =>
        table.outgoing.filter(counts(table)).filter((r) => !placed.has(r.to.table)),
      );
      if (!closing) break;
      deferred.push(closing);
      continue;
    }
    const [table] = waiting.splice(ready, 1);
    if (!table) break;
    order.push(table);
    placed.add(table.name);
  }
  return { order: [...order, ...waiting], deferred };
}

/**
 * Walks blockers from the last waiting table until it comes back to a table on its path: the
 * relation that comes back closes a cycle.
 */
function closingRelation(
  waiting: readonly CodeTable[],
  blockers: (table: CodeTable) => CodeRelation[],
): CodeRelation | undefined {
  const byName = new Map(waiting.map((table) => [table.name, table]));
  const path: string[] = [];
  let current = waiting[waiting.length - 1];
  while (current) {
    path.push(current.name);
    const next = blockers(current)[0];
    if (!next) return undefined;
    if (path.includes(next.to.table)) return next;
    current = byName.get(next.to.table);
  }
  return undefined;
}
