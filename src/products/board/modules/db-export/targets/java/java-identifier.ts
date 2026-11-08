import { RESERVED } from "../../code";

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * A name Java accepts as a field or constant: a keyword gets a trailing `_` (`class` → `class_`),
 * anything else invalid is cleaned and starts with `_`. `keyword` says when a keyword was renamed.
 */
export function javaIdentifier(name: string): { name: string; keyword: boolean } {
  if (RESERVED.java.has(name)) return { name: `${name}_`, keyword: true };
  if (IDENTIFIER.test(name)) return { name, keyword: false };
  const clean = name.replace(/[^A-Za-z0-9_$]/g, "_");
  return { name: /^[0-9]/.test(clean) ? `_${clean}` : clean || "_", keyword: false };
}

/**
 * The column or table name Spring Boot's default naming gives a Java name
 * (`CamelCaseToUnderscoresNamingStrategy`): `lastName` → `last_name`, `OrderItem` → `order_item`.
 */
export function springPhysicalName(name: string): string {
  const chars = [...name.replace(/\./g, "_")];
  const lower = (c: string | undefined) => c !== undefined && c !== c.toUpperCase();
  const upper = (c: string | undefined) => c !== undefined && c !== c.toLowerCase();
  for (let i = 1; i < chars.length - 1; i++) {
    if (lower(chars[i - 1]) && upper(chars[i]) && lower(chars[i + 1])) chars.splice(i++, 0, "_");
  }
  return chars.join("").toLowerCase();
}
