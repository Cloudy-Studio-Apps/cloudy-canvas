import type { ErAttributeElement } from "../../attribute/attribute.types";
import { guessColumnType } from "./guess-column-type";
import type { AttributeColumns, TablesContext } from "./tables-context.types";

/**
 * The columns of an owner's attributes: composite ones become their parts (`dirección_calle`),
 * derived ones are left out, multivalued ones get tables of their own (`multivaluedTables`).
 */
export function attributeColumns(
  ctx: TablesContext,
  ownerId: string,
  prefix = "",
): AttributeColumns {
  const result: AttributeColumns = { columns: [], keys: [], partialKeys: [], alternates: [] };
  for (const attribute of ownAttributes(ctx, ownerId)) {
    if (attribute.derived) {
      ctx.warnings.push(`${attribute.name} is derived, so it has no column.`);
      continue;
    }
    if (attribute.multivalued) continue;
    const name = `${prefix}${attribute.name}`;
    const parts = ownAttributes(ctx, attribute.id);
    const made: AttributeColumns =
      parts.length > 0
        ? attributeColumns(ctx, attribute.id, `${name}_`)
        : {
            columns: [{ name, type: guessColumnType(name) }],
            keys: [],
            partialKeys: [],
            alternates: [],
          };
    result.columns.push(...made.columns);
    const names = made.columns.map((c) => c.name);
    if (attribute.key === "pk") result.keys.push(...names);
    else if (attribute.key === "partial") result.partialKeys.push(...names);
    else if (attribute.key === "alternate") result.alternates.push(names);
    else {
      result.keys.push(...made.keys);
      result.partialKeys.push(...made.partialKeys);
      result.alternates.push(...made.alternates);
    }
  }
  return result;
}

/** An owner's own attributes, in their order. */
export function ownAttributes(ctx: TablesContext, ownerId: string): ErAttributeElement[] {
  return ctx.shapes.attributes
    .filter((a) => a.ownerId === ownerId)
    .sort((a, b) => a.order - b.order);
}
