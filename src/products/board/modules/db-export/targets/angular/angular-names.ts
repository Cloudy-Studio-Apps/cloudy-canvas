import { className, toKebab, toPascal, uniqueNames } from "../../code";
import type { CodeSchema } from "../../model";
import type { AngularNames } from "./angular-names.types";

/** Type and file names: `order_items` → `OrderItem` in `order-item.model.ts`. */
export function angularNames(schema: CodeSchema, suffix: boolean): AngularNames {
  const tables = schema.tables.map((table) => table.name);
  const enums = schema.enums.map((e) => e.name);
  const types = uniqueNames([...tables.map(className), ...enums.map(toPascal)]);
  const typeOf = new Map(
    [...tables, ...enums.map((e) => `enum:${e}`)].map((n, i) => [n, types[i] ?? n]),
  );
  const model = (table: string) => typeOf.get(table) ?? className(table);
  const enumType = (name: string) => typeOf.get(`enum:${name}`) ?? toPascal(name);
  return {
    model,
    enumType,
    modelFile: (table) => `${toKebab(model(table))}${suffix ? ".model" : ""}`,
    enumFile: (name) => `${toKebab(enumType(name))}${suffix ? ".enum" : ""}`,
  };
}
