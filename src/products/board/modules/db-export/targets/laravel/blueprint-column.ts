import { plural } from "../../code";
import type { CodeColumn, CodeDefault, CodeRelation } from "../../model";
import type { BlueprintContext } from "./blueprint-column.types";
import { warn } from "../warnings";
import { phpList, phpString } from "./php";
import { blueprintMethod, isInteger } from "./type-map";

/** One `$table->…;` line of a create migration. */
export function blueprintColumn(column: CodeColumn, ctx: BlueprintContext): string {
  const name = phpString(column.name);
  const modifiers: string[] = [];
  if (!column.notNull && !column.pk) modifiers.push("nullable()");
  if (column.unique && !column.pk) modifiers.push("unique()");
  if (column.default) modifiers.push(defaultModifier(column.default, ctx));
  if (column.note) modifiers.push(`comment(${phpString(column.note)})`);
  const chain = (start: string, end: string[] = []) =>
    `$table->${[start, ...modifiers, ...end].join("->")};`;

  const single = ctx.table.primaryKey.length === 1;
  if (column.pk && single && column.increment && isInteger(column)) {
    if (column.name === "id") return "$table->id();";
    return chain(`${column.type === "bigint" ? "bigIncrements" : "increments"}(${name})`);
  }
  const relation = ctx.relation;
  if (relation || ctx.deferred) {
    const constrained = relation && !ctx.deferred ? [constrainedCall(column.name, relation)] : [];
    if (isInteger(column)) return chain(`foreignId(${name})`, constrained);
    if (column.type === "uuid") return chain(`foreignUuid(${name})`, constrained);
  }
  const primary = column.pk && single ? ["primary()"] : [];
  if (column.enum) {
    const values = ctx.enums.find((e) => e.name === column.enum)?.values.map((v) => v.name) ?? [];
    return chain(`enum(${name}, ${phpList(values)})`, primary);
  }
  const method = blueprintMethod(column);
  if (!method) {
    ctx.warnings.push(
      warn(
        "unknown-type",
        {
          table: ctx.table.name,
          column: column.name,
          type: column.type,
          target: "Laravel",
          fallback: "text",
        },
        { table: ctx.table.name, column: column.name },
      ),
    );
    return chain(`text(${name})`, primary);
  }
  const [fn, args] = method;
  return chain(`${fn}(${[name, ...args.map(String)].join(", ")})`, primary);
}

/** `constrained()`, with the table and column only when they aren't Laravel's guess. */
function constrainedCall(column: string, relation: CodeRelation): string {
  const guess = column.endsWith("_id") ? plural(column.slice(0, -3)) : null;
  const conventional = guess === relation.to.table && relation.to.column === "id";
  if (conventional) return "constrained()";
  if (relation.to.column === "id") return `constrained(${phpString(relation.to.table)})`;
  return `constrained(${phpString(relation.to.table)}, ${phpString(relation.to.column)})`;
}

function defaultModifier(value: CodeDefault, ctx: BlueprintContext): string {
  switch (value.kind) {
    case "string":
      return `default(${phpString(value.value)})`;
    case "boolean":
    case "number":
      return `default(${value.value})`;
    case "null":
      return "default(null)";
    case "expr":
      if (/^(now\(\)|current_timestamp(\(\))?)$/i.test(value.value)) return "useCurrent()";
      ctx.usesDb.value = true;
      return `default(DB::raw(${phpString(value.value)}))`;
  }
}

/** Whether a foreign key column is written as `foreignId`/`foreignUuid` (else `$table->foreign`). */
export function shortForeignKey(column: CodeColumn): boolean {
  return isInteger(column) || column.type === "uuid";
}
