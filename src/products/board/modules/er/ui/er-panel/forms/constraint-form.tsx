import { ArrowLeftRight } from "lucide-react";

import type { ErConstraintRule } from "../../../constraint/constraint.types";
import { Button } from "@shared/ui/kit";
import { useErDiagram, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { entityOptions, relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { ShapeSelect } from "./shape-select";
import type { ConstraintFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

const RULES: { value: ErConstraintRule; label: string; hint: string }[] = [
  {
    value: "exclusive",
    label: t("form.constraint.exclusive"),
    hint: t("form.constraint.exclusiveHint"),
  },
  {
    value: "inclusive",
    label: t("form.constraint.inclusive"),
    hint: t("form.constraint.inclusiveHint"),
  },
  {
    value: "exclusion",
    label: t("form.constraint.exclusion"),
    hint: t("form.constraint.exclusionHint"),
  },
  {
    value: "inclusion",
    label: t("form.constraint.inclusion"),
    hint: t("form.constraint.inclusionHint"),
  },
];

/** A constraint between two relations (and, for exclusive / inclusive, the entity in both). */
export function ConstraintForm({ constraint }: ConstraintFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const relations = relationOptions(shapes);
  const rule = RULES.find((r) => r.value === constraint.rule);
  const withEntity = constraint.rule === "exclusive" || constraint.rule === "inclusive";
  const directed = constraint.rule === "inclusive" || constraint.rule === "inclusion";

  return (
    <div className="space-y-4">
      <FormField label={t("form.constraint.kind")}>
        <ShapeSelect
          aria-label={t("form.constraint.kind")}
          value={constraint.rule}
          options={RULES}
          className="w-full"
          onChange={(value) =>
            er.edits.updateConstraint(constraint.id, { rule: value as ErConstraintRule })
          }
        />
      </FormField>
      {rule && <p className="text-xs text-muted-foreground">{rule.hint}</p>}
      {withEntity && (
        <FormField label={t("form.constraint.entity")}>
          <ShapeSelect
            aria-label={t("form.constraint.entity")}
            value={constraint.entityId}
            placeholder={t("form.constraint.choose")}
            options={entityOptions(shapes)}
            className="w-full"
            onChange={(entityId) => er.edits.updateConstraint(constraint.id, { entityId })}
          />
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
      {constraint.rule === "inclusive" && (
        <FormField label={t("form.constraint.howMany")}>
          <CardinalityPicker
            min={constraint.min}
            max={constraint.max}
            onChange={(min, max) => er.edits.updateConstraint(constraint.id, { min, max })}
          />
        </FormField>
      )}
    </div>
  );
}
