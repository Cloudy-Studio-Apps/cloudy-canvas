import { Plus } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useErDiagram, useErShapes } from "../../model";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { memberName } from "./shape-label";
import { ShapeChips } from "./shape-chips";
import { ShapeSelect } from "./shape-select";
import { UnionPicture } from "./union-picture";
import { UnionTables } from "./union-tables";
import { useErGoTo } from "./use-er-go-to";
import { FormHint, OpenShape } from "./visual";
import type { UnionFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A union type (category): its drawing, the category, what it can be and the keys it adds. */
export function UnionForm({ union }: UnionFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const { goTo } = useErGoTo();
  const options = entityOptions(shapes);
  const name = memberName(shapes, union.categoryId);
  const free = options.filter(
    (o) => o.value !== union.categoryId && !union.superclassIds.includes(o.value),
  );

  return (
    <div className="space-y-4">
      <UnionPicture union={union} />
      <FormHint>{t("form.union.intro", { name })}</FormHint>
      <FormField label={t("form.union.category")}>
        <div className="flex items-center gap-1">
          <ShapeSelect
            aria-label={t("form.union.category")}
            value={union.categoryId}
            options={options}
            className="flex-1"
            onChange={(categoryId) => er.edits.setUnionCategory(union.id, categoryId)}
          />
          <OpenShape id={union.categoryId} label={name} />
        </div>
      </FormField>
      <FormSection title={t("form.union.superclasses")}>
        <ShapeChips
          chips={union.superclassIds.map((id) => ({
            id,
            label: memberName(shapes, id),
            removeLabel: t("form.union.remove"),
            onRemove: () => er.edits.removeUnionSuperclass(union.id, id),
          }))}
        />
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            title={t("form.union.newTitle")}
            onClick={() => {
              const id = er.edits.addUnionSuperclassEntity(union.id);
              if (id) goTo(id);
            }}
          >
            <Plus />
            {t("form.isa.newEntity")}
          </Button>
          {free.length > 0 && (
            <ShapeSelect
              aria-label={t("form.union.addExisting")}
              value=""
              placeholder={t("form.isa.addExisting")}
              options={free}
              onChange={(entityId) => entityId && er.edits.addUnionSuperclass(union.id, entityId)}
            />
          )}
        </div>
      </FormSection>
      <FormSection title={t("form.union.tablesTitle")}>
        <UnionTables union={union} />
      </FormSection>
    </div>
  );
}
