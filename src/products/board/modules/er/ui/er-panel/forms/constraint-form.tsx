import { ArrowLeftRight } from "lucide-react";

import type { ErConstraintRule } from "../../../constraint/constraint.types";
import { Button } from "@shared/ui/kit";
import { useErDiagram, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { entityOptions, relationOptions } from "./entity-options";
import { FormField } from "./form-field";
import { ShapeSelect } from "./shape-select";
import type { ConstraintFormProps } from "./entity-form.types";

const RULES: { value: ErConstraintRule; label: string; hint: string }[] = [
  {
    value: "exclusive",
    label: "Exclusividad",
    hint: "The entity takes part in only one of the two relations.",
  },
  {
    value: "inclusive",
    label: "Inclusividad",
    hint: "To take part in the second, the entity must take part in the first (min,max) times.",
  },
  {
    value: "exclusion",
    label: "Exclusión",
    hint: "The same occurrences can't be in both relations.",
  },
  {
    value: "inclusion",
    label: "Inclusión",
    hint: "Occurrences of the second relation must exist in the first.",
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
      <FormField label="Kind">
        <ShapeSelect
          aria-label="Kind"
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
        <FormField label="Entity">
          <ShapeSelect
            aria-label="Entity"
            value={constraint.entityId}
            placeholder="Choose…"
            options={entityOptions(shapes)}
            className="w-full"
            onChange={(entityId) => er.edits.updateConstraint(constraint.id, { entityId })}
          />
        </FormField>
      )}
      <div className="flex items-end gap-1">
        <FormField label={directed ? "Required relation" : "Relation"}>
          <ShapeSelect
            aria-label="First relation"
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
          aria-label="Swap relations"
          title="Swap relations"
          onClick={() =>
            er.edits.updateConstraint(constraint.id, {
              fromId: constraint.toId,
              toId: constraint.fromId,
            })
          }
        >
          <ArrowLeftRight />
        </Button>
        <FormField label={directed ? "Relation that needs it" : "Other relation"}>
          <ShapeSelect
            aria-label="Second relation"
            value={constraint.toId}
            options={relations}
            className="w-full"
            onChange={(toId) => er.edits.updateConstraint(constraint.id, { toId })}
          />
        </FormField>
      </div>
      {constraint.rule === "inclusive" && (
        <FormField label="How many times">
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
