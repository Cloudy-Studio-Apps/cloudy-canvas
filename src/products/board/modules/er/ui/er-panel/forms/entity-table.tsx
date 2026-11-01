import { tableOfShape } from "../../../model";
import { useErQuery, useErShapes } from "../../model";
import { FormHint, TableCard, tableRows } from "./visual";
import { keySource } from "./shape-label";
import type { EntityFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** The table an entity becomes, saying where the keys it receives come from. */
export function EntityTable({ entity }: EntityFormProps) {
  const model = useErQuery((diagram) => diagram.tablesModel());
  const shapes = useErShapes();
  const table = tableOfShape(model, entity.id);
  if (!table) return null;
  const rows = tableRows(table, "entity", (column) => ({
    fresh: column.added,
    tag: column.added
      ? t("form.table.added")
      : column.fromShape
        ? t("form.table.from", { name: keySource(shapes, column.fromShape) })
        : undefined,
  }));
  const isChild = shapes.isas.some((i) => i.children.some((c) => c.entityId === entity.id));
  const parent = shapes.isas.find((i) => i.children.some((c) => c.entityId === entity.id));
  const category = shapes.unions.some((u) => u.categoryId === entity.id);
  const name = entity.name;
  const note = isChild
    ? t("form.table.child", {
        name,
        parent: parent ? keySource(shapes, parent.id) : "",
      })
    : category
      ? t("form.table.category", { name })
      : table.columns.some((c) => c.added)
        ? t("form.table.noKey")
        : table.pk.length > 1
          ? t("form.table.keys", { name })
          : t("form.table.key", { name });

  return (
    <div className="space-y-1.5">
      <TableCard title={table.name} rows={rows} color={entity.color} />
      <FormHint>{note}</FormHint>
    </div>
  );
}
