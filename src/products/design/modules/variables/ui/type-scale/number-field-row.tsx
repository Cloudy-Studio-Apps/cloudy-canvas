import { Field, NumberInput } from "@shared/ui/kit";
import type { NumberFieldRowProps } from "./type-scale-ui.types";

/** A labelled number of the type scale form. */
export function NumberFieldRow({
  label,
  value,
  min,
  max,
  step,
  decimals,
  onChange,
}: NumberFieldRowProps) {
  return (
    <Field label={label} layout="inline">
      <NumberInput
        label={label}
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        decimals={decimals ?? 0}
        onChange={(next) => onChange(next)}
      />
    </Field>
  );
}
