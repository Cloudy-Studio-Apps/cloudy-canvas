import { cn } from "@shared/ui/lib/utils";
import { Checkbox } from "../checkbox";
import type { CheckboxFieldProps } from "./checkbox-field.types";

/** A labelled checkbox row of a panel or form (the label muted, clicking it toggles too). */
export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
  className,
}: CheckboxFieldProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onChange}
      label={label}
      disabled={disabled}
      className={cn("text-muted-foreground", className)}
    />
  );
}
