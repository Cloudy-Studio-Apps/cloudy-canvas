import { plural, singular, toCamel, toSnake, uniqueNames } from "../../code";
import type { CodeRelation, CodeSchema, CodeTable } from "../../model";
import type { LaravelNames } from "./laravel-names.types";
import type { LaravelRelation } from "./model-relations.types";
import { phpString } from "./php";

/**
 * A model's relation methods: `belongsTo` for its foreign keys, `hasMany` / `hasOne` for the
 * foreign keys pointing at it, `belongsToMany` through the pivot table Laravel would name
 * (`product_tag`) when the schema has it. Keys are passed only when they aren't Laravel's
 * defaults. Relations with tables that aren't exported are left out.
 */
export function modelRelations(
  table: CodeTable,
  schema: CodeSchema,
  names: LaravelNames,
): LaravelRelation[] {
  const relations = [
    ...table.outgoing.filter((r) => !r.external).map((r) => belongsTo(r, names)),
    ...table.incoming.filter((r) => !r.external).map((r) => hasManyOrOne(r, names)),
    ...schema.manyToMany.flatMap((r) => belongsToMany(table, r, schema, names)),
  ];
  const unique = uniqueNames(relations.map((relation) => relation.name));
  return relations.map((relation, i) => ({ ...relation, name: unique[i] ?? relation.name }));
}

function belongsTo(relation: CodeRelation, names: LaravelNames): LaravelRelation {
  const fk = relation.from.column;
  const name = fk.endsWith("_id") ? toCamel(fk.slice(0, -3)) : toCamel(singular(relation.to.table));
  const args = [`${names.model(relation.to.table)}::class`];
  const ownerKey = relation.to.column !== "id";
  if (fk !== `${toSnake(name)}_id` || ownerKey) args.push(phpString(fk));
  if (ownerKey) args.push(phpString(relation.to.column));
  return { name, type: "BelongsTo", call: `$this->belongsTo(${args.join(", ")})` };
}

function hasManyOrOne(relation: CodeRelation, names: LaravelNames): LaravelRelation {
  const related = names.model(relation.from.table);
  const one = relation.kind === "one-to-one";
  const name = toCamel(one ? related : plural(related));
  const args = [`${related}::class`];
  const defaultFk = `${toSnake(names.model(relation.to.table))}_id`;
  const localKey = relation.to.column !== "id";
  if (relation.from.column !== defaultFk || localKey) args.push(phpString(relation.from.column));
  if (localKey) args.push(phpString(relation.to.column));
  const method = one ? "hasOne" : "hasMany";
  return { name, type: one ? "HasOne" : "HasMany", call: `$this->${method}(${args.join(", ")})` };
}

/** Laravel's pivot name for two tables: their singular snake names, sorted, joined by `_`. */
export function pivotName(a: string, b: string): string {
  return [toSnake(singular(a)), toSnake(singular(b))].sort().join("_");
}

function belongsToMany(
  table: CodeTable,
  relation: CodeRelation,
  schema: CodeSchema,
  names: LaravelNames,
): LaravelRelation[] {
  const ends = [relation.from.table, relation.to.table];
  if (!ends.includes(table.name)) return [];
  const other = ends.find((end) => end !== table.name) ?? table.name;
  const pivot = pivotName(table.name, other);
  if (!schema.tables.some((t) => t.name === pivot)) return [];
  const related = names.model(other);
  return [
    {
      name: toCamel(plural(related)),
      type: "BelongsToMany",
      call: `$this->belongsToMany(${related}::class)`,
    },
  ];
}
