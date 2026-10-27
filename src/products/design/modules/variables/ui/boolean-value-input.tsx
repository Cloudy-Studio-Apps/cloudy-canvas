import { FieldBox } from "@design/ui/components/panel";
import { cn, Switch } from "@shared/ui/kit";
import type { PlainValueInputProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

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
      <span className="text-xs text-muted-foreground">
        {value ? t("values.true") : t("values.false")}
      </span>
    </FieldBox>
  );
}
