import { ChevronDown, X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { Button, IconButton, SelectField, cn } from "@shared/ui/kit";
import { CONDITION_OPS, opTakesValue, type ConditionOp } from "../../bindings";
import { FieldPicker } from "./field-picker";
import { pickedLabel } from "./picked-label";
import type { ConditionFieldProps } from "./condition-field.types";
import { t } from "../../data.i18n";

/** "Show when": a field, how it's tested and, for a comparison, the value it's tested with. */
export function ConditionField({ condition, names, onChange }: ConditionFieldProps) {
  const ops = CONDITION_OPS.map((op) => ({ value: op, label: t(`condition.ops.${op}`) }));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <FieldPicker
          names={names}
          value={condition?.path}
          onPick={(path) => onChange({ op: "exists", ...condition, path })}
        >
          <Button
            variant="outline"
            size="xs"
            aria-label={t("condition.field")}
            className={cn(
              "min-w-0 flex-1 justify-between font-normal",
              !condition && "text-muted-foreground",
            )}
            title={condition?.path}
          >
            <span className="truncate">
              {condition ? pickedLabel(names, condition.path) : t("section.fields.choose")}
            </span>
            <ChevronDown />
          </Button>
        </FieldPicker>
        {condition && (
          <IconButton size="xs" label={t("condition.clear")} onClick={() => onChange(null)}>
            <X />
          </IconButton>
        )}
      </div>
      {condition && (
        <div className="flex min-w-0 items-center gap-1.5">
          <SelectField<ConditionOp>
            label={t("condition.op")}
            value={condition.op}
            options={ops}
            onChange={(op) => onChange({ ...condition, op })}
            className="min-w-0 flex-1"
          />
          {opTakesValue(condition.op) && (
            <CommitInput
              aria-label={t("condition.value")}
              placeholder={t("condition.value")}
              value={condition.value === undefined ? "" : String(condition.value)}
              onCommit={(value) => onChange({ ...condition, value })}
              className="h-7 min-w-0 flex-1 text-xs"
            />
          )}
        </div>
      )}
    </div>
  );
}
