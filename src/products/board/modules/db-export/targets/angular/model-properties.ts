import { plural, singular, toCamel, uniqueNames } from "../../code";
import type { CodeSchema, CodeTable } from "../../model";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import type { AngularNames } from "./angular-names.types";
import type { TsProperty } from "./model-properties.types";
import { tsType } from "./type-map";

/**
 * A model's properties: its columns (camelCase, `| null` when nullable, optional when the database
 * fills them), then its relations as optional nested objects or arrays. Relations with tables that
 * aren't exported are left out.
 */
export function modelProperties(
  table: CodeTable,
  schema: CodeSchema,
  names: AngularNames,
  warnings: CodeWarning[],
): { properties: TsProperty[]; uses: Set<string> } {
  const uses = new Set<string>();
  const columns = table.columns.map((column): TsProperty => {
    let type = tsType(column, names.enumType);
    if (!type) {
      type = { type: "unknown", comment: column.type };
      const at = { table: table.name, column: column.name };
      warnings.push(
        warn(
          "unknown-type",
          { ...at, type: column.type, target: "TypeScript", fallback: "unknown" },
          at,
        ),
      );
    }
    if (column.enum) uses.add(`enum:${column.enum}`);
    const nullable = !column.notNull && !column.pk;
    return {
      name: toCamel(column.name),
      optional: column.default !== null || column.increment,
      type: nullable && type.type !== "unknown" ? `${type.type} | null` : type.type,
      comment: type.comment,
    };
  });

  const relation = (name: string, table: string, many: boolean): TsProperty => {
    uses.add(table);
    const model = names.model(table);
    return { name, optional: true, type: many ? `${model}[]` : model, comment: "" };
  };
  const relations: TsProperty[] = [
    ...table.outgoing
      .filter((r) => !r.external)
      .map((r) => {
        const fk = r.from.column;
        const name = fk.endsWith("_id") ? toCamel(fk.slice(0, -3)) : toCamel(singular(r.to.table));
        return relation(name, r.to.table, false);
      }),
    ...table.incoming
      .filter((r) => !r.external)
      .map((r) => {
        const many = r.kind !== "one-to-one";
        const model = names.model(r.from.table);
        return relation(toCamel(many ? plural(model) : model), r.from.table, many);
      }),
    ...schema.manyToMany
      .filter((r) => r.from.table === table.name || r.to.table === table.name)
      .map((r) => {
        const other = r.from.table === table.name ? r.to.table : r.from.table;
        return relation(toCamel(plural(names.model(other))), other, true);
      }),
  ];
  uses.delete(table.name);
  const all = [...columns, ...relations];
  const unique = uniqueNames(all.map((p) => p.name));
  return { properties: all.map((p, i) => ({ ...p, name: unique[i] ?? p.name })), uses };
}
