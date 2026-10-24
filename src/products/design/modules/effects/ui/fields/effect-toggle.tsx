import { Checkbox } from "@shared/ui/kit";
import type { EffectToggleProps } from "./fields.types";

/** A labeled checkbox of an effect's editor. */
export function EffectToggle({ label, checked, onChange }: EffectToggleProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(next) => onChange(next)}
      label={label}
      className="text-muted-foreground"
    />
  );
}
