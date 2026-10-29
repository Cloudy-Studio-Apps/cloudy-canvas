import { className, plural, singular, toCamel, toPascal } from "../../code";
import type { CodeRelation, CodeSchema } from "../../model";
import type { RelationProps } from "./relation-props.types";

/**
 * The relation properties of every model, named once for the whole schema so both sides agree:
 * `user_id` gives `user` on its model and `orders` on `User`. Names that clash with a column or an
 * earlier relation of the same model get a number. Relations with tables that aren't exported are
 * left out.
 */
export function relationProps(
  schema: CodeSchema,
  model: (table: string) => string,
): RelationProps[] {
  const taken = new Map<string, Set<string>>(
    schema.tables.map((table) => [table.name, new Set(table.columns.map((c) => toCamel(c.name)))]),
  );
  const claim = (table: string, name: string) => {
    const names = taken.get(table) ?? new Set<string>();
    taken.set(table, names);
    let unique = name;
    for (let n = 2; names.has(unique); n++) unique = `${name}${n}`;
    names.add(unique);
    return unique;
  };
  const relations: CodeRelation[] = [
    ...schema.tables.flatMap((table) => table.outgoing.filter((r) => !r.external)),
    ...schema.manyToMany,
  ];
  const pairs = new Map<string, number>();
  const pairOf = (r: CodeRelation) => [r.from.table, r.to.table].sort().join("|");
  for (const r of relations) pairs.set(pairOf(r), (pairs.get(pairOf(r)) ?? 0) + 1);

  return relations.map((relation) => {
    const { from, to, kind } = relation;
    const fk = from.column;
    const fromName =
      kind === "many-to-many"
        ? toCamel(plural(model(to.table)))
        : fk.endsWith("_id")
          ? toCamel(fk.slice(0, -3))
          : toCamel(singular(to.table));
    const toName =
      kind === "one-to-one" ? toCamel(model(from.table)) : toCamel(plural(model(from.table)));
    const named = from.table === to.table || (pairs.get(pairOf(relation)) ?? 0) > 1;
    return {
      relation,
      from: claim(from.table, fromName),
      to: claim(to.table, toName),
      name: named ? `${toPascal(model(from.table))}${toPascal(fromName)}` : null,
    };
  });
}

/** A table's model class name (`order_items` → `OrderItem`). */
export const nestModel = (table: string) => className(table);
