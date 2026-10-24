import { FieldBox } from "@design/ui/components/panel";
import { cn, Switch } from "@shared/ui/kit";
import type { PlainValueInputProps } from "./variables-ui.types";

/** A true/false variable's value: a switch, its state named beside it. */
export function BooleanValueInput({
  value,
  label,
  onChange,
  className,
}: PlainValueInputProps<boolean>) {
  return (
    <FieldBox className={cn("min-w-0 flex-1 gap-2 pl-2", className)}>
      <Switch aria-label={label} checked={value} onCheckedChange={onChange} />
      <span className="text-xs text-muted-foreground">{value ? "True" : "False"}</span>
    </FieldBox>
  );
}
