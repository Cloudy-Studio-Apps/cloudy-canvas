import { useErQuery, useErShapes } from "../../model";
import { tableOfShape } from "../../../model";
import { memberName } from "./shape-label";
import { FormHint, ShapeLink, TableCard, tableRows } from "./visual";
import type { UnionFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** The column a union adds to each of its superclasses' tables. */
export function UnionTables({ union }: UnionFormProps) {
  const model = useErQuery((diagram) => diagram.tablesModel());
  const shapes = useErShapes();
  const cards = union.superclassIds.flatMap((id) => {
    const table = tableOfShape(model, id);
    if (!table) return [];
    const rows = tableRows(table, id, (column) => ({
      fresh: column.fromShape === union.id,
      tag: column.fromShape === union.id ? "+" : undefined,
    })).filter((row) => row.fresh);
    return [{ id, rows }];
  });
  if (cards.length === 0) return null;
  const column = cards[0]?.rows[0]?.name ?? "";
  const name = memberName(shapes, union.categoryId);

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        {cards.map((card) => (
          <TableCard
            key={card.id}
            title={<ShapeLink id={card.id} label={memberName(shapes, card.id)} />}
            rows={card.rows}
          />
        ))}
      </div>
      <FormHint>{t("form.union.tables", { column, name })}</FormHint>
    </div>
  );
}
