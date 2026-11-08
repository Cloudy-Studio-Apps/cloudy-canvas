import { toConstant } from "../../code";
import { javaIdentifier } from "./java-identifier";

/**
 * An enum value's constant. Plain Java follows the convention (`in_progress` → `IN_PROGRESS`);
 * `keepValue` (JPA's `EnumType.STRING` stores the constant's name) keeps the database value when
 * Java accepts it as a name, so what's stored is what the schema says.
 */
export function enumConstant(value: string, keepValue: boolean): string {
  if (keepValue) {
    const kept = javaIdentifier(value);
    if (kept.name === value) return value;
  }
  const constant = toConstant(value);
  return constant === "" || /^[0-9]/.test(constant) ? `VALUE_${constant}` : constant;
}
