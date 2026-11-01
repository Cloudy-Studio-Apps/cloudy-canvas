import type { ErAttributeElement } from "../../attribute/attribute.types";
import type { ErRelationElement } from "../../relation/relation.types";
import type { ErAttributeColumns, ErRelationKeys } from "./table-lookups.types";
import type { TableDraft } from "./tables-context.types";
import type { ErTablesModel } from "./to-tables.types";

/** The table an ER shape became, if any. */
export function tableOfShape(model: ErTablesModel, id: string): TableDraft | undefined {
  const name = model.tableOf.get(id);
  return model.tables.find((table) => table.name === name);
}

/** Where a relation's keys went; `null` when it has none yet (fewer than two sides with tables). */
export function relationKeys(
  model: ErTablesModel,
  relation: ErRelationElement,
): ErRelationKeys | null {
  const table = model.tables.find((t) => t.columns.some((c) => c.fromShape === relation.id));
  if (!table) return null;
  const columns = table.columns.filter((c) => c.fromShape === relation.id);
  const pointedAt = new Set(columns.map((c) => c.fromSide));
  const holder =
    relation.participants.find(
      (p) => !pointedAt.has(p.id) && tableOfShape(model, p.entityId) === table,
    ) ?? null;
  const identifies = holder !== null && columns.every((c) => table.pk.includes(c.name));
  return { table, columns, holder, identifies };
}

/** The columns an attribute became (its parts' for a composite one), wherever they went. */
export function attributeColumnsIn(
  model: ErTablesModel,
  attributes: readonly ErAttributeElement[],
  id: string,
): ErAttributeColumns | null {
  const ids = new Set([id]);
  // Parts come in no particular order, so grow the set until it stops changing.
  for (let size = 0; size !== ids.size;) {
    size = ids.size;
    for (const a of attributes) if (ids.has(a.ownerId)) ids.add(a.id);
  }
  for (const table of model.tables) {
    const columns = table.columns.filter((c) => c.attributeId && ids.has(c.attributeId));
    if (columns.length > 0) return { table, columns };
  }
  return null;
}
