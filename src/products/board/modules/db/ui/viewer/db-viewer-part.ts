import { defineViewerPart } from "../../../viewer/ui";
import { t } from "../../db.i18n";
import { DbSchema } from "../../schema";
import { DbViewerPanel } from "./db-viewer-panel";
import type { DbViewerData } from "./db-viewer-part.types";

/** Lucide's database, as the viewer draws icons. */
const DATABASE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>';

/** The schema in the HTML viewer: its DBML, per table or enum and whole. */
export const dbViewerPart = defineViewerPart<DbViewerData>({
  id: "db",
  types: ["db-table", "db-enum"],
  button: { icon: { svg: DATABASE_ICON }, label: t("viewer.schema"), order: 10 },
  collect(doc) {
    const schema = new DbSchema(doc);
    const tables = schema.tables();
    const enums = schema.enums();
    if (tables.length === 0 && enums.length === 0) return null;
    const items: DbViewerData["items"] = {};
    for (const table of tables)
      items[table.id] = { name: table.name, code: schema.tableDbml(table.id) };
    for (const item of enums) items[item.id] = { name: item.name, code: schema.enumDbml(item.id) };
    return { schema: schema.schemaDbml(), items };
  },
  panel: DbViewerPanel,
});
