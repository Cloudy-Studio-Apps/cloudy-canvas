import { Checkbox } from "@shared/ui/kit";
import type { ToggleProps } from "./sidebar.types";

/** A labelled checkbox for one of the brochure's settings. */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(next) => onChange(next)}
      label={label}
      className="text-muted-foreground"
    />
  );
}
