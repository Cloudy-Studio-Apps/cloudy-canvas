import { clamp } from "@canvas";
import { commitFieldProps, useCommitField } from "@canvas-ui";
import type { PercentInputProps } from "./color-inputs.types";
import { parseNumber } from "./parse-number";

/** A bare input for a 0–100% value (stored 0–1), with its "%"; place it in a `FieldBox`. */
export function PercentInput({ value, label, onCommit }: PercentInputProps) {
  const field = useCommitField(String(Math.round(value * 100)), (draft) => {
    const percent = parseNumber(draft);
    if (percent === null) return "Enter a percentage";
    onCommit(clamp(percent, 0, 100) / 100);
  });
  return (
    <>
      <input
        aria-label={label}
        inputMode="decimal"
        {...commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true })}
        className="w-full min-w-0 bg-transparent text-foreground tabular-nums outline-none"
      />
      <span className="text-subtle-foreground">%</span>
    </>
  );
}
