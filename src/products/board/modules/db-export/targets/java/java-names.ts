import { className, toPascal, uniqueNames } from "../../code";
import type { CodeSchema } from "../../model";
import type { JavaNames } from "./java-names.types";

/** Class names: `order_items` → `OrderItem`; a table and an enum that meet get a number. */
export function javaNames(schema: CodeSchema): JavaNames {
  const tables = schema.tables.map((table) => table.name);
  const enums = schema.enums.map((e) => e.name);
  const types = uniqueNames([...tables.map(className), ...enums.map(toPascal)]);
  const typeOf = new Map(
    [...tables, ...enums.map((e) => `enum:${e}`)].map((n, i) => [n, types[i] ?? n]),
  );
  return {
    model: (table) => typeOf.get(table) ?? className(table),
    enumType: (name) => typeOf.get(`enum:${name}`) ?? toPascal(name),
  };
}
