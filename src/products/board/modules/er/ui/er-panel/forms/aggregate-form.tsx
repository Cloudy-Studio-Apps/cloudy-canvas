import { ChoiceCards } from "@shared/ui/kit";
import { CommitInput } from "@canvas-ui";
import { tableOfShape } from "../../../model";
import { useErDiagram, useErQuery, useErShapes } from "../../model";
import { AggregatePicture } from "./aggregate-picture";
import { AttributeList } from "./attribute-list";
import { relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { FormHint, TableCard, tableRows } from "./visual";
import type { AggregateFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** An aggregation: its drawing, its name, the relation it boxes, its attributes and its table. */
export function AggregateForm({ aggregate }: AggregateFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const model = useErQuery((diagram) => diagram.tablesModel());
  const table = tableOfShape(model, aggregate.id);

  return (
    <div className="space-y-4">
      <AggregatePicture aggregate={aggregate} />
      <FormHint>{t("form.aggregate.hint")}</FormHint>
      <FormField label={t("form.aggregate.name")}>
        <CommitInput
          value={aggregate.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateAggregate(aggregate.id, { name: name.trim() })
              : t("form.nameIt")
          }
        />
      </FormField>
      <FormSection title={t("form.aggregate.relation")}>
        <ChoiceCards
          label={t("form.aggregate.relation")}
          columns={3}
          value={aggregate.relationId}
          onChange={(relationId) => er.edits.updateAggregate(aggregate.id, { relationId })}
          options={relationOptions(shapes).map((option) => ({
            value: option.value,
            label: option.label,
            picture: (
              <svg
                viewBox="0 0 40 24"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-6 w-10"
              >
                <path d="M20 2 38 12 20 22 2 12Z" />
              </svg>
            ),
          }))}
        />
      </FormSection>
      <AttributeList ownerId={aggregate.id} />
      {table && (
        <FormSection title={t("form.table.title")}>
          <TableCard
            fresh
            title={table.name}
            rows={tableRows(table, "agg", (column) => ({ fresh: Boolean(column.ref) }))}
          />
          <FormHint>{t("form.aggregate.table")}</FormHint>
        </FormSection>
      )}
    </div>
  );
}
