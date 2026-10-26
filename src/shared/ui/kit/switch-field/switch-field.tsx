import { cn } from "@shared/ui/lib/utils";
import { Switch } from "../primitives";
import type { SwitchFieldProps } from "./switch-field.types";

/** A labelled switch row of a panel: the label left, the switch right. */
export function SwitchField({ label, checked, onChange, disabled, className }: SwitchFieldProps) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {label}
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </label>
  );
}
