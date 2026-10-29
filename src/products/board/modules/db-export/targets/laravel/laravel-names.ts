import { className, collisions, RESERVED, toPascal, uniqueNames } from "../../code";
import type { CodeSchema } from "../../model";
import { warn } from "../warnings";
import type { CodeWarning } from "../warnings.types";
import type { LaravelNames } from "./laravel-names.types";

/**
 * Class names for every table (`order_items` → `OrderItem`) and enum (`order_status` →
 * `OrderStatus`, kept apart from models since they live in `App\Enums`). Names that collide are
 * numbered and warned about; reserved words are warned about.
 */
export function laravelNames(schema: CodeSchema): LaravelNames {
  const warnings: CodeWarning[] = [];
  const tables = schema.tables.map((table) => table.name);
  const enums = schema.enums.map((e) => e.name);
  const tableClasses = numbered(tables, tables.map(className), warnings);
  const enumClasses = numbered(enums, enums.map(toPascal), warnings);
  for (const name of [...tableClasses.values(), ...enumClasses.values()]) {
    if (RESERVED.php.has(name.toLowerCase())) {
      warnings.push(warn("reserved-word", { name, target: "PHP" }));
    }
  }
  return {
    model: (table) => tableClasses.get(table) ?? className(table),
    enumClass: (name) => enumClasses.get(name) ?? toPascal(name),
    warnings,
  };
}

function numbered(
  sources: readonly string[],
  converted: readonly string[],
  warnings: CodeWarning[],
): Map<string, string> {
  for (const collision of collisions(
    sources.map((source, i) => ({ source, converted: converted[i] ?? source })),
  )) {
    warnings.push(
      warn("name-collision", {
        names: collision.sources.join(", "),
        converted: collision.converted,
      }),
    );
  }
  const unique = uniqueNames(converted);
  return new Map(sources.map((source, i) => [source, unique[i] ?? source]));
}
