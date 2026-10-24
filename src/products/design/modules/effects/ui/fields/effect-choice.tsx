import { SegmentedControl } from "@shared/ui/kit";
import type { EffectChoiceProps } from "./fields.types";

/** A segmented choice of an effect's editor (Uniform / Progressive, Mono / Duo / Multi). */
export function EffectChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: EffectChoiceProps<T>) {
  return (
    <SegmentedControl
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      size="sm"
      fullWidth
    />
  );
}
