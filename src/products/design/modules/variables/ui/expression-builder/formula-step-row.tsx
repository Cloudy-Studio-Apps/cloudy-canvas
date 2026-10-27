import { X } from "lucide-react";

import type { FormulaOperator } from "@canvas";
import { IconButton, SegmentedControl } from "@shared/ui/kit";
import { ChainEditor } from "./chain-editor";
import type { FormulaStepRowProps } from "./expression-builder.types";
import { OperandField } from "./operand-field";
import { t } from "../../variables.i18n";

const OPERATORS: readonly { value: FormulaOperator; label: string; title: string }[] = [
  { value: "+", label: "+", title: t("builder.add") },
  { value: "-", label: "−", title: t("builder.subtract") },
  { value: "*", label: "×", title: t("builder.multiply") },
  { value: "/", label: "÷", title: t("builder.divide") },
];

/**
 * One step of a formula: an operator, then a variable, a number, or a group (its own start and
 * steps, boxed between parentheses).
 */
export function FormulaStepRow({
  step,
  index,
  onChange,
  onRemove,
  modes,
  depth,
}: FormulaStepRowProps) {
  const { operand } = step;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <SegmentedControl
          label={t("builder.step", { n: index + 1 })}
          size="sm"
          value={step.op}
          onChange={(op) => onChange({ ...step, op })}
          options={OPERATORS}
        />
        <IconButton label={t("builder.removeStep")} size="xs" onClick={onRemove}>
          <X />
        </IconButton>
      </div>
      {operand.kind === "group" ? (
        <div className="flex gap-1.5">
          <span className="pt-0.5 font-mono text-sm text-subtle-foreground">(</span>
          <div className="min-w-0 flex-1 rounded-md border border-border p-2">
            <ChainEditor
              chain={operand.chain}
              depth={depth + 1}
              modes={modes}
              onChange={(chain) => onChange({ ...step, operand: { kind: "group", chain } })}
            />
          </div>
          <span className="self-end pb-0.5 font-mono text-sm text-subtle-foreground">)</span>
        </div>
      ) : (
        <OperandField
          label={t("builder.stepValue", { n: index + 1 })}
          operand={operand}
          onChange={(next) => onChange({ ...step, operand: next })}
          modes={modes}
        />
      )}
    </div>
  );
}
