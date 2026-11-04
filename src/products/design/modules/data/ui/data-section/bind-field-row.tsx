import { X } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { FieldPickerButton } from "./field-picker-button";
import type { BindFieldRowProps } from "./bind-field-row.types";
import { t } from "../../data.i18n";

/** One field of the layer data can fill: its name, the data field it takes, and unbind. */
export function BindFieldRow({ field, binding, names, onChange }: BindFieldRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground" title={field.label}>
        {field.label}
      </span>
      <FieldPickerButton
        names={names}
        value={binding?.path}
        onPick={(path) => onChange({ ...binding, path })}
      />
      {binding && (
        <IconButton size="xs" label={t("section.fields.clear")} onClick={() => onChange(null)}>
          <X />
        </IconButton>
      )}
    </div>
  );
}
