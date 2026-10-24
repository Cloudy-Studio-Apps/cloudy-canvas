import { X } from "lucide-react";

import { DEFAULT_VALUE, valueKeyOf } from "@canvas";
import { NumberField } from "@design/ui/components/panel";
import { useBoard } from "../use-board";
import { ValueField } from "../../value-field";
import type { ModeValueCardProps } from "./inspector.types";
import { SameAsFirst } from "./same-as-first";

/** A number variable in one mode: its value, or "same as …" for a later mode without one. */
export function NumberModeRow({ variable, mode, first }: ModeValueCardProps) {
  const { tokens, store, modes } = useBoard();
  const key = valueKeyOf(store, mode.id);
  const value = variable.values[key];
  if (!value) {
    return (
      <SameAsFirst variable={variable} mode={mode} firstName={modes[0]?.name ?? "the first"} />
    );
  }
  if (!("number" in value))
    return <ValueField variable={variable} mode={mode.id} label={mode.name} />;
  return (
    <div className="flex items-center gap-2">
      {modes.length > 1 && (
        <span className="w-16 shrink-0 truncate text-xs text-muted-foreground">{mode.name}</span>
      )}
      <NumberField
        prefix="#"
        label={`${mode.name} value`}
        value={value.number}
        onCommit={(number) => tokens.setValue(variable.id, mode.id, { number })}
        className="min-w-0 flex-1"
      />
      {!first && key !== DEFAULT_VALUE && (
        <button
          type="button"
          aria-label="Use the first mode's value"
          onClick={() => tokens.clearValue(variable.id, key)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
