import { singular } from "./inflect";
import type { ConvertedName, NameCollision } from "./naming.types";

/** The lowercase words of a name: snake, kebab, camel, Pascal or spaced. */
export function words(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.toLowerCase());
}

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** `order_items` → `OrderItems`. */
export function toPascal(name: string): string {
  return words(name).map(capital).join("");
}

/** `order_id` → `orderId`. */
export function toCamel(name: string): string {
  const [first = "", ...rest] = words(name);
  return first + rest.map(capital).join("");
}

/** `OrderItem` → `order_item`. */
export function toSnake(name: string): string {
  return words(name).join("_");
}

/** `OrderItem` → `order-item`. */
export function toKebab(name: string): string {
  return words(name).join("-");
}

/** `ORDER_STATUS`-style constant name. */
export function toConstant(name: string): string {
  return words(name).join("_").toUpperCase();
}

/** A table's class name: Pascal and singular (`order_items` → `OrderItem`). */
export function className(table: string): string {
  return toPascal(singular(toSnake(table)));
}

/** The converted names more than one source turns into. */
export function collisions(names: readonly ConvertedName[]): NameCollision[] {
  const bySource = new Map<string, string[]>();
  for (const { source, converted } of names) {
    bySource.set(converted, [...(bySource.get(converted) ?? []), source]);
  }
  return [...bySource]
    .filter(([, sources]) => sources.length > 1)
    .map(([converted, sources]) => ({ converted, sources }));
}

/** The names with repeats numbered: `OrderItem`, `OrderItem` → `OrderItem`, `OrderItem2`. */
export function uniqueNames(names: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    return count === 1 ? name : `${name}${count}`;
  });
}
