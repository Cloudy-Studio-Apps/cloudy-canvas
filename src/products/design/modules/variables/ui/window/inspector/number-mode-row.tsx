import { valueKeyOf } from "@canvas";
import { useBoard } from "../use-board";
import { ValueField } from "../../value-field";
import type { ModeValueCardProps } from "./inspector.types";
import { SameAsFirst } from "./same-as-first";

/**
 * A number variable in one mode: its value (a number, an alias or an expression, with the Σ
 * builder), or "same as …" for a later mode without one.
 */
export function NumberModeRow({ variable, mode }: ModeValueCardProps) {
  const { store, modes } = useBoard();
  const value = variable.values[valueKeyOf(store, mode.id)];
  if (!value) {
    return (
      <SameAsFirst variable={variable} mode={mode} firstName={modes[0]?.name ?? "the first"} />
    );
  }
  return (
    <div className="flex items-center gap-2">
      {modes.length > 1 && (
        <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">{mode.name}</span>
      )}
      <ValueField
        variable={variable}
        mode={mode.id}
        label={`${mode.name} value`}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
