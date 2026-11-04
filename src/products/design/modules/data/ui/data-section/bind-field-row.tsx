import { ChevronDown, X } from "lucide-react";

import { Button, IconButton, cn } from "@shared/ui/kit";
import { FieldPicker } from "./field-picker";
import { pickedLabel } from "./picked-label";
import type { BindFieldRowProps } from "./bind-field-row.types";
import { t } from "../../data.i18n";

/** One field of the layer data can fill: its name, the data field it takes, and unbind. */
export function BindFieldRow({ field, binding, names, onChange }: BindFieldRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground" title={field.label}>
        {field.label}
      </span>
      <FieldPicker
        names={names}
        value={binding?.path}
        onPick={(path) => onChange({ ...binding, path })}
      >
        <Button
          variant="outline"
          size="xs"
          className={cn(
            "min-w-0 flex-1 justify-between font-normal",
            !binding && "text-muted-foreground",
          )}
          title={binding?.path}
        >
          <span className="truncate">
            {binding ? pickedLabel(names, binding.path) : t("section.fields.choose")}
          </span>
          <ChevronDown />
        </Button>
      </FieldPicker>
      {binding && (
        <IconButton size="xs" label={t("section.fields.clear")} onClick={() => onChange(null)}>
          <X />
        </IconButton>
      )}
    </div>
  );
}
