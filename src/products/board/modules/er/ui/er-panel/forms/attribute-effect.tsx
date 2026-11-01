import { ArrowRight } from "lucide-react";

import { attributeColumnsIn } from "../../../model";
import type { ErTablesModel, ErShapes } from "../../../model";
import { useErQuery, useErShapes } from "../../model";
import { AttributeOval, FormHint, TableCard, tableRows } from "./visual";
import type { AttributeFormProps } from "./attribute-form.types";
import { t } from "../../../er.i18n";

/** What an attribute makes: its oval on the board beside what it becomes in a table. */
export function AttributeEffect({ attribute }: AttributeFormProps) {
  const model = useErQuery((diagram) => diagram.tablesModel());
  const shapes = useErShapes();
  const found = attributeColumnsIn(model, shapes.attributes, attribute.id);
  const { table, rows } = tableOf(attribute, found, model, shapes);

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[96px_16px_minmax(0,1fr)] items-center gap-1.5">
        <div className="flex flex-col items-center gap-0.5 text-foreground">
          <AttributeOval
            attribute={attribute}
            label={attribute.name.slice(0, 8)}
            className="h-[52px] w-[92px]"
          />
          <span className="text-[11px] text-muted-foreground">{t("form.effect.board")}</span>
        </div>
        <ArrowRight className="size-4 text-primary" aria-hidden />
        <div className="min-w-0 space-y-0.5 text-center">
          {table ? (
            <TableCard title={table} rows={rows} fresh={attribute.multivalued} />
          ) : (
            <FormHint>{t("form.effect.noTable")}</FormHint>
          )}
          <span className="text-[11px] text-muted-foreground">{t("form.effect.table")}</span>
        </div>
      </div>
      <FormHint>{note(attribute, found !== null, shapes)}</FormHint>
    </div>
  );
}

function tableOf(
  attribute: AttributeFormProps["attribute"],
  found: ReturnType<typeof attributeColumnsIn>,
  model: ErTablesModel,
  shapes: ErShapes,
) {
  if (found) {
    const shown = new Set(found.columns.map((c) => c.name));
    const rows = tableRows(found.table, "effect").filter(
      (row) => attribute.multivalued || shown.has(row.name),
    );
    return {
      table: found.table.name,
      rows: rows.map((row) => ({
        ...row,
        fresh: attribute.multivalued,
        tag: attribute.key === "alternate" ? t("form.effect.unique") : undefined,
      })),
    };
  }
  if (!attribute.derived) return { table: "", rows: [] };
  const owner = model.tables.find((table) => model.tableOf.get(attribute.ownerId) === table.name);
  const name =
    owner?.name ?? shapes.entities.find((e) => e.id === attribute.ownerId)?.name ?? attribute.name;
  return {
    table: name,
    rows: [{ id: "effect:gone", name: attribute.name, key: null, gone: true }],
  };
}

function note(
  attribute: AttributeFormProps["attribute"],
  saved: boolean,
  shapes: ErShapes,
): string {
  if (attribute.derived) return t("form.effect.derived");
  if (shapes.isas.some((i) => i.id === attribute.ownerId)) return t("form.effect.discriminator");
  if (attribute.multivalued) return t("form.effect.multi");
  if (!saved) return t("form.effect.notSaved");
  if (shapes.attributes.some((a) => a.ownerId === attribute.id)) return t("form.effect.parts");
  if (attribute.key === "pk") return t("form.effect.key");
  if (attribute.key === "partial") return t("form.effect.partial");
  if (attribute.key === "alternate") return t("form.effect.alternate");
  if (shapes.relations.some((r) => r.id === attribute.ownerId)) return t("form.effect.relation");
  return attribute.optional ? t("form.effect.optional") : t("form.effect.plain");
}
