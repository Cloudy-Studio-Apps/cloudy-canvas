import { X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { IconButton, SelectField } from "@shared/ui/kit";
import { CONDITION_OPS, opTakesValue, type ConditionOp } from "../../bindings";
import { FieldPickerButton } from "./field-picker-button";
import type { ConditionFieldProps } from "./condition-field.types";
import { t } from "../../data.i18n";

/** "Show when": a field, how it's tested and, for a comparison, the value it's tested with. */
export function ConditionField({ condition, names, onChange }: ConditionFieldProps) {
  const ops = CONDITION_OPS.map((op) => ({ value: op, label: t(`condition.ops.${op}`) }));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <FieldPickerButton
          names={names}
          value={condition?.path}
          label={t("condition.field")}
          onPick={(path) => onChange({ op: "exists", ...condition, path })}
        />
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
