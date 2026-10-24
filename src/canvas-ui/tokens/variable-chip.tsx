import { Unlink } from "lucide-react";

import { tokenLeafOf } from "@canvas";
import { IconButton } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import type { VariableChipProps } from "./tokens.types";
import { useDocumentTokens } from "./use-document-tokens";
import { VariablePicker } from "./variable-picker";
import { VariableValue } from "./variable-value";

/**
 * A bound field's look: the variable's value and name in place of the field's input (it can't be
 * typed into). Clicking it picks another variable; the unlink button detaches it, keeping the
 * value.
 */
export function VariableChip({
  variableId,
  modes,
  type,
  scopes,
  onPick,
  onDetach,
  className,
}: VariableChipProps) {
  const { store } = useDocumentTokens();
  const variable = variableId ? store.variable(variableId) : undefined;
  return (
    <div
      className={cn(
        "flex h-7 min-w-0 items-center gap-1 rounded-md border border-border bg-surface-sunken pr-0.5",
        className,
      )}
    >
      <VariablePicker
        type={type}
        scopes={scopes}
        value={variableId}
        modes={modes}
        onPick={onPick}
        align="start"
      >
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the chip's value, the picker's trigger */}
        <button
          type="button"
          className="flex h-full min-w-0 flex-1 items-center gap-1.5 rounded-md pl-1.5 text-left text-xs hover:bg-muted"
          title={variable ? variable.name : "Mixed variables"}
        >
          {variable && <VariableValue variable={variable} modes={modes} />}
          <span className="truncate font-medium">
            {variable ? tokenLeafOf(variable.name) : "Mixed"}
          </span>
        </button>
      </VariablePicker>
      <IconButton size="xs" label="Detach variable" onClick={onDetach}>
        <Unlink />
      </IconButton>
    </div>
  );
}
