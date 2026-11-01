import { ArrowLeftRight } from "lucide-react";

import type { ErConstraintRule } from "../../../constraint/constraint.types";
import { Button } from "@shared/ui/kit";
import { useErDiagram, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { ConstraintPicture } from "./constraint-picture";
import { CONSTRAINT_GLYPHS } from "./constraint-rules";
import { entityOptions, relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { memberName } from "./shape-label";
import { ShapeSelect } from "./shape-select";
import { FormHint, OpenShape, ToggleTile } from "./visual";
import type { ConstraintFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

const RULES: readonly ErConstraintRule[] = ["exclusive", "inclusive", "exclusion", "inclusion"];

/** A constraint between two relations (and, for exclusive / inclusive, the entity in both). */
export function ConstraintForm({ constraint }: ConstraintFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const relations = relationOptions(shapes);
  const { rule } = constraint;
  const withEntity = rule === "exclusive" || rule === "inclusive";
  const directed = rule === "inclusive" || rule === "inclusion";
  const relationName = (id: string) => shapes.relations.find((r) => r.id === id)?.name ?? "?";
  const entity = memberName(shapes, constraint.entityId);

  return (
    <div className="space-y-4">
      <ConstraintPicture constraint={constraint} />
      <FormHint>
        {t(`form.constraint.say.${rule}`, {
          name: entity || "?",
          first: relationName(constraint.fromId),
          second: relationName(constraint.toId),
          min: constraint.min,
          max: constraint.max,
        })}
      </FormHint>
      <FormSection title={t("form.constraint.kind")}>
        <div className="grid grid-cols-2 gap-1">
          {RULES.map((value) => (
            <ToggleTile
              key={value}
              picture={
                <svg
                  viewBox="0 0 40 30"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-[30px] w-10"
                >
                  {CONSTRAINT_GLYPHS[value]}
                </svg>
              }
              label={t(`form.constraint.rule.${value}`)}
              hint={t(`form.constraint.rule.${value}Hint`)}
              title={t(`form.constraint.${value}Hint`)}
              on={rule === value}
              onToggle={() => er.edits.updateConstraint(constraint.id, { rule: value })}
            />
          ))}
        </div>
      </FormSection>
      {withEntity && (
        <FormField label={t("form.constraint.entity")}>
          <div className="flex items-center gap-1">
            <ShapeSelect
              aria-label={t("form.constraint.entity")}
              value={constraint.entityId}
              placeholder={t("form.constraint.choose")}
              options={entityOptions(shapes)}
              className="min-w-0 flex-1"
              onChange={(entityId) => er.edits.updateConstraint(constraint.id, { entityId })}
            />
            <OpenShape id={constraint.entityId} label={entity} />
          </div>
        </FormField>
      )}
      <div className="flex items-end gap-1">
        <FormField
          label={directed ? t("form.constraint.requiredRelation") : t("form.constraint.relation")}
        >
          <ShapeSelect
            aria-label={t("form.constraint.first")}
            value={constraint.fromId}
            options={relations}
            className="w-full"
            onChange={(fromId) => er.edits.updateConstraint(constraint.id, { fromId })}
          />
        </FormField>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={t("form.constraint.swap")}
          title={t("form.constraint.swap")}
          onClick={() =>
            er.edits.updateConstraint(constraint.id, {
              fromId: constraint.toId,
              toId: constraint.fromId,
            })
          }
        >
          <ArrowLeftRight />
        </Button>
        <FormField label={directed ? t("form.constraint.needsIt") : t("form.constraint.other")}>
          <ShapeSelect
            aria-label={t("form.constraint.second")}
            value={constraint.toId}
            options={relations}
            className="w-full"
            onChange={(toId) => er.edits.updateConstraint(constraint.id, { toId })}
          />
        </FormField>
      </div>
      {rule === "inclusive" && (
        <FormField label={t("form.constraint.howMany")}>
          <CardinalityPicker
            min={constraint.min}
            max={constraint.max}
            onChange={(min, max) => er.edits.updateConstraint(constraint.id, { min, max })}
          />
        </FormField>
      )}
      <FormHint>{t("form.constraint.noTable")}</FormHint>
    </div>
  );
}
