import { plural, toKebab, toPascal } from "../../../code";
import { nestModel } from "../relation-props";

/** Nest's feature folder of a table: `order_items` → `order-items`. */
export const featureFolder = (table: string) => toKebab(plural(nestModel(table)));

/** `src/<feature>/entities/<name>.entity.ts`, without `.ts`. */
export const entityPath = (table: string) =>
  `src/${featureFolder(table)}/entities/${toKebab(nestModel(table))}.entity`;

/** `src/common/enums/<name>.enum.ts`, without `.ts`. */
export const enumPath = (name: string) => `src/common/enums/${toKebab(toPascal(name))}.enum`;

/** The relative import from one file (without `.ts`) to another. */
export function relativeImport(from: string, to: string): string {
  const fromParts = from.split("/").slice(0, -1);
  const toParts = to.split("/");
  let common = 0;
  while (common < fromParts.length && fromParts[common] === toParts[common]) common++;
  const up = fromParts.length - common;
  const rest = toParts.slice(common).join("/");
  return up === 0 ? `./${rest}` : `${"../".repeat(up)}${rest}`;
}
