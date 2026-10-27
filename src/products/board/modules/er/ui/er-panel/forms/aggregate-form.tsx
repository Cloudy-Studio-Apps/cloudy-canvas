import { CommitInput } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { AttributeList } from "./attribute-list";
import { relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { ShapeSelect } from "./shape-select";
import type { AggregateFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** An aggregation: its name, the relation it boxes, and its own attributes. */
export function AggregateForm({ aggregate }: AggregateFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();

  return (
    <div className="space-y-4">
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
      <FormField label={t("form.aggregate.relation")}>
        <ShapeSelect
          aria-label={t("form.aggregate.relation")}
          value={aggregate.relationId}
          options={relationOptions(shapes)}
          className="w-full"
          onChange={(relationId) => er.edits.updateAggregate(aggregate.id, { relationId })}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">{t("form.aggregate.hint")}</p>
      <AttributeList ownerId={aggregate.id} />
    </div>
  );
}
