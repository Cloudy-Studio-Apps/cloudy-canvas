import { clamp } from "@canvas";
import { commitFieldProps, useCommitField } from "@canvas-ui";
import { FieldBox } from "./field-box";
import type { NumberFieldProps } from "./number-field.types";
import { parseNumber } from "./parse-number";

/** Shown rounded to this many decimals. */
const DECIMALS = 2;

/**
 * A compact number box (X 120): commits on Enter or blur as one undo step, reverts on Escape, and
 * shows "Mixed" when the selection's values differ.
 */
export function NumberField({
  prefix,
  label,
  value,
  suffix,
  min = -Infinity,
  max = Infinity,
  onCommit,
  className,
}: NumberFieldProps) {
  const field = useCommitField(value === null ? "" : format(value), (draft) => {
    const parsed = parseNumber(draft);
    if (parsed === null) return "Enter a number";
    onCommit(clamp(parsed, min, max));
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });

  return (
    <FieldBox title={bindings.title ?? label} invalid={!!field.error} className={className}>
      <span className="flex w-3 shrink-0 justify-center text-subtle-foreground [&_svg]:size-3">
        {prefix}
      </span>
      <input
        aria-label={label}
        inputMode="decimal"
        placeholder={value === null ? "Mixed" : undefined}
        {...bindings}
        className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none placeholder:text-subtle-foreground"
      />
      {suffix && <span className="text-subtle-foreground">{suffix}</span>}
    </FieldBox>
  );
}

function format(value: number): string {
  return String(Number(value.toFixed(DECIMALS)));
}
