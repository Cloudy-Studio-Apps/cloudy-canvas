import { Parentheses, Plus } from "lucide-react";

import type { FormulaStep } from "@canvas";
import { VariablePicker } from "@canvas-ui";
import { Button } from "@shared/ui/kit";
import type { ChainEditorProps } from "./expression-builder.types";
import { FormulaStepRow } from "./formula-step-row";
import { OperandField } from "./operand-field";
import { t } from "../../variables.i18n";

/** How deep groups nest in the builder (deeper ones are typed). */
const MAX_GROUP_DEPTH = 3;

/**
 * A start and its steps, applied in order, with buttons that add a variable step, a number step
 * or a group (a step worked out on its own first, in parentheses). The formula and each group
 * are one of these.
 */
export function ChainEditor({ chain, onChange, modes, depth }: ChainEditorProps) {
  const add = (step: FormulaStep) => onChange({ ...chain, steps: [...chain.steps, step] });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          {depth === 0 ? t("builder.startFrom") : t("builder.groupStartsFrom")}
        </span>
        <OperandField
          label={depth === 0 ? t("builder.startFrom") : t("builder.groupStartsFrom")}
          operand={chain.start}
          onChange={(start) => onChange({ ...chain, start })}
          modes={modes}
        />
      </div>
      {chain.steps.map((step, i) => (
        <FormulaStepRow
          key={i}
          step={step}
          index={i}
          depth={depth}
          modes={modes}
          onChange={(next) =>
            onChange({ ...chain, steps: chain.steps.map((s, j) => (j === i ? next : s)) })
          }
          onRemove={() => onChange({ ...chain, steps: chain.steps.filter((_, j) => j !== i) })}
        />
      ))}
      <div className="flex flex-wrap items-center gap-1">
        <VariablePicker
          type="number"
          scopes={[]}
          value={null}
          modes={modes}
          align="start"
          onPick={(id) => add({ op: "+", operand: { kind: "variable", id } })}
        >
          <Button variant="ghost" size="xs">
            <Plus /> {t("builder.addVariable")}
          </Button>
        </VariablePicker>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => add({ op: "*", operand: { kind: "number", value: 2 } })}
        >
          <Plus /> {t("builder.addNumber")}
        </Button>
        {depth < MAX_GROUP_DEPTH ? (
          <Button
            variant="ghost"
            size="xs"
            title={t("builder.groupHint")}
            onClick={() =>
              add({
                op: "*",
                operand: {
                  kind: "group",
                  chain: { start: { kind: "number", value: 1 }, steps: [] },
                },
              })
            }
          >
            <Parentheses /> {t("builder.group")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
