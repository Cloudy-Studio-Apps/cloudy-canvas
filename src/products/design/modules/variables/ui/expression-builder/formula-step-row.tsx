import { X } from "lucide-react";

import type { FormulaOperator } from "@canvas";
import { IconButton, SegmentedControl } from "@shared/ui/kit";
import { ChainEditor } from "./chain-editor";
import type { FormulaStepRowProps } from "./expression-builder.types";
import { OperandField } from "./operand-field";

const OPERATORS: readonly { value: FormulaOperator; label: string; title: string }[] = [
  { value: "+", label: "+", title: "Add" },
  { value: "-", label: "−", title: "Subtract" },
  { value: "*", label: "×", title: "Multiply by" },
  { value: "/", label: "÷", title: "Divide by" },
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
          label={`Step ${index + 1}: what it does`}
          size="sm"
          value={step.op}
          onChange={(op) => onChange({ ...step, op })}
          options={OPERATORS}
        />
        <IconButton label="Remove this step" size="xs" onClick={onRemove}>
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
          label={`Step ${index + 1} value`}
          operand={operand}
          onChange={(next) => onChange({ ...step, operand: next })}
          modes={modes}
        />
      )}
    </div>
  );
}
