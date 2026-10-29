import { CodeWriter } from "../../code";
import type { CodeEnum, CodeTable } from "../../model";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import { bsonType } from "./bson-type-map";

const js = (text: string) => JSON.stringify(text);

/** One collection: `createCollection` with its `$jsonSchema` validator, then its indexes. */
export function writeCollection(
  table: CodeTable,
  enums: readonly CodeEnum[],
  warnings: CodeWarning[],
): string {
  const w = new CodeWriter("  ");
  const target = "MongoDB";
  const required = table.columns.filter((c) => c.notNull && !c.increment).map((c) => c.name);
  const references = new Map(table.outgoing.map((r) => [r.from.column, r]));

  if (table.note) w.line(`// ${table.note}`);
  w.line(`db.createCollection(${js(table.name)}, {`);
  w.indent(() => {
    w.line("validator: {");
    w.indent(() => {
      w.line("$jsonSchema: {");
      w.indent(() => {
        w.line('bsonType: "object",');
        if (required.length > 0) w.line(`required: [${required.map(js).join(", ")}],`);
        w.line("properties: {");
        w.indent(() => {
          for (const column of table.columns) {
            const at = { table: table.name, column: column.name };
            if (column.increment)
              warnings.push(warn("unsupported-increment", { ...at, target }, at));
            if (column.default) {
              warnings.push(
                warn("unsupported-default", { ...at, value: column.default.value, target }, at),
              );
            }
            const relation = references.get(column.name);
            if (relation) warnings.push(warn("unsupported-reference", { ...at, target }, at));
            const values = column.enum
              ? (enums.find((e) => e.name === column.enum)?.values.map((v) => v.name) ?? [])
              : null;
            let type = values ? "string" : bsonType(column);
            if (type === null) {
              warnings.push(
                warn("unknown-type", { ...at, type: column.type, target, fallback: "string" }, at),
              );
              type = "string";
            }
            const nullable = !column.notNull && !column.pk;
            const bson = column.array ? '"array"' : nullable ? `[${js(type)}, "null"]` : js(type);
            const parts = [`bsonType: ${bson}`];
            if (column.array) parts.push(`items: { bsonType: ${js(type)} }`);
            if (values)
              parts.push(`enum: [${values.map(js).join(", ")}${nullable ? ", null" : ""}]`);
            const max =
              column.type === "varchar" || column.type === "char" ? column.args[0] : undefined;
            if (max !== undefined && !column.array) parts.push(`maxLength: ${max}`);
            if (column.note) parts.push(`description: ${js(column.note)}`);
            const comment = relation
              ? ` // references ${relation.to.table}.${relation.to.column}`
              : "";
            w.line(`${js(column.name)}: { ${parts.join(", ")} },${comment}`);
          }
        });
        w.line("},");
      });
      w.line("},");
    });
    w.line("},");
  });
  w.line("});");

  const collection = `db.getCollection(${js(table.name)})`;
  const keyed = (columns: readonly string[]) =>
    `{ ${columns.map((c) => `${js(c)}: 1`).join(", ")} }`;
  if (table.primaryKey.length > 0 && table.primaryKey.join() !== "_id") {
    w.line(`${collection}.createIndex(${keyed(table.primaryKey)}, { unique: true });`);
  }
  for (const column of table.columns.filter((c) => c.unique && !c.pk)) {
    w.line(`${collection}.createIndex(${keyed([column.name])}, { unique: true });`);
  }
  for (const index of table.indexes) {
    if (index.exprs.length > 0) {
      warnings.push(
        warn("unsupported-index", { table: table.name, target }, { table: table.name }),
      );
      continue;
    }
    const options = [
      ...(index.unique ? ["unique: true"] : []),
      ...(index.name ? [`name: ${js(index.name)}`] : []),
    ];
    const tail = options.length > 0 ? `, { ${options.join(", ")} }` : "";
    w.line(`${collection}.createIndex(${keyed(index.columns)}${tail});`);
  }
  return w.toString();
}
