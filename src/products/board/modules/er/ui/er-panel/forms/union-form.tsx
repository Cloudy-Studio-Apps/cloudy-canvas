import { Plus, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { useEngine } from "@canvas-ui";
import { useErDiagram, useErShapes } from "../../model";
import { entityOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { IconAction } from "./icon-action";
import { ShapeSelect } from "./shape-select";
import type { UnionFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** A union type (category): the category entity and the superclasses it unites. */
export function UnionForm({ union }: UnionFormProps) {
  const engine = useEngine();
  const er = useErDiagram();
  const shapes = useErShapes();
  const options = entityOptions(shapes);
  const nameOf = (id: string) => options.find((o) => o.value === id)?.label ?? "?";
  const free = options.filter(
    (o) => o.value !== union.categoryId && !union.superclassIds.includes(o.value),
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t("form.union.intro", { name: nameOf(union.categoryId) })}
      </p>
      <FormField label={t("form.union.category")}>
        <ShapeSelect
          aria-label={t("form.union.category")}
          value={union.categoryId}
          options={options}
          onChange={(categoryId) => er.edits.setUnionCategory(union.id, categoryId)}
        />
      </FormField>
      <FormSection
        title={t("form.union.superclasses")}
        actions={
          <Button
            variant="ghost"
            size="sm"
            title={t("form.union.newTitle")}
            onClick={() => {
              const id = er.edits.addUnionSuperclassEntity(union.id);
              if (id) engine.focusElement(id);
            }}
          >
            <Plus />
            {t("form.isa.newEntity")}
          </Button>
        }
      >
        <ul className="divide-y">
          {union.superclassIds.map((id) => (
            <li key={id} className="flex items-center gap-1 py-1.5 text-sm">
              <span className="flex-1">{nameOf(id)}</span>
              <IconAction
                label={t("form.union.remove")}
                danger
                onClick={() => er.edits.removeUnionSuperclass(union.id, id)}
              >
                <Trash2 />
              </IconAction>
            </li>
          ))}
        </ul>
        {free.length > 0 && (
          <ShapeSelect
            aria-label={t("form.union.addExisting")}
            value=""
            placeholder={t("form.isa.addExisting")}
            options={free}
            className="w-full"
            onChange={(entityId) => entityId && er.edits.addUnionSuperclass(union.id, entityId)}
          />
        )}
      </FormSection>
    </div>
  );
}
