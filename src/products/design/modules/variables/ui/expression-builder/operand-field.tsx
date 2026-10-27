import { Braces, Hash } from "lucide-react";
import type { ReactNode } from "react";

import { resolveVariable } from "@canvas";
import { useDocumentTokens, VariablePicker } from "@canvas-ui";
import { IconButton, NumberInput } from "@shared/ui/kit";
import type { OperandFieldProps } from "./expression-builder.types";
import { t } from "../../variables.i18n";

/**
 * One value a formula reads: a typed number with a button to pick a number variable instead, or
 * the picked variable (click to pick another) with a button back to a number.
 */
export function OperandField({ operand, onChange, modes, label }: OperandFieldProps) {
  const { store } = useDocumentTokens();
  const variable = operand.kind === "variable" ? store.variable(operand.id) : undefined;
  const value = variable ? resolveVariable(store, variable.id, modes) : null;
  const shown = value?.type === "number" ? Math.round(value.number * 100) / 100 : null;
  const picker = (trigger: ReactNode) => (
    <VariablePicker
      type="number"
      scopes={[]}
      value={variable?.id ?? null}
      modes={modes}
      onPick={(id) => onChange({ kind: "variable", id })}
    >
      {trigger}
    </VariablePicker>
  );

  if (operand.kind === "number") {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <NumberInput
          label={label}
          value={operand.value}
          decimals={4}
          onChange={(next, info) => info.done && onChange({ kind: "number", value: next })}
          className="min-w-0 flex-1"
        />
        {picker(
          <IconButton label={t("builder.useVariable")} size="xs">
            <Braces />
          </IconButton>,
        )}
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      {picker(
        <button
          type="button"
          aria-label={t("builder.pickAnother", {
            label,
            name: variable?.name ?? t("builder.missingAria"),
          })}
          title={variable?.name ?? t("builder.gone")}
          className="flex h-control-sm min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-surface px-2 text-left text-xs hover:bg-muted"
        >
          <Braces className="size-3.5 shrink-0 text-subtle-foreground" />
          <span className="min-w-0 flex-1 truncate">{variable?.name ?? t("builder.missing")}</span>
          <span className="shrink-0 text-subtle-foreground tabular-nums">{shown ?? "?"}</span>
        </button>,
      )}
      <IconButton
        label={t("builder.useNumber")}
        size="xs"
        onClick={() => onChange({ kind: "number", value: shown ?? 1 })}
      >
        <Hash />
      </IconButton>
    </div>
  );
}
