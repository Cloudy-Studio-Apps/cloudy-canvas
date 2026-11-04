import { ChevronDown } from "lucide-react";

import { Button, cn } from "@shared/ui/kit";
import { FieldPicker } from "./field-picker";
import { pickedLabel } from "./picked-label";
import type { FieldPickerButtonProps } from "./field-picker-button.types";
import { t } from "../../data.i18n";

/** A field picker's button: the chosen field's label (or a placeholder) and a chevron. */
export function FieldPickerButton({
  names,
  value,
  onPick,
  label,
  placeholder,
}: FieldPickerButtonProps) {
  return (
    <FieldPicker names={names} value={value} onPick={onPick}>
      <Button
        variant="outline"
        size="xs"
        aria-label={label}
        className={cn(
          "min-w-0 flex-1 justify-between font-normal",
          value === undefined && "text-muted-foreground",
        )}
        title={value}
      >
        <span className="truncate">
          {value === undefined
            ? (placeholder ?? t("section.fields.choose"))
            : pickedLabel(names, value)}
        </span>
        <ChevronDown />
      </Button>
    </FieldPicker>
  );
}
