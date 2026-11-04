import { CommitInput } from "@canvas-ui";
import { CheckboxField, SelectField, cn } from "@shared/ui/kit";
import type { FieldType } from "../../source";
import { fieldTypeOptions } from "./field-type-label";
import type { FieldRowProps } from "./field-row.types";
import { t } from "../../data.i18n";

/** One field of the data: its path, its name (alias), its type, hidden, and a sample value. */
export function FieldRow({ field, sample, onChange }: FieldRowProps) {
  return (
    <li className={cn("flex flex-col gap-1 py-1.5", field.hidden && "opacity-60")}>
      <div className="flex min-w-0 items-center gap-1.5">
        <code className="min-w-0 flex-1 truncate text-xs text-foreground" title={field.path}>
          {field.path}
        </code>
        <CheckboxField
          label={t("fields.hidden")}
          checked={field.hidden === true}
          onChange={(hidden) => onChange({ ...field, hidden })}
        />
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <CommitInput
          aria-label={t("fields.alias")}
          value={field.alias ?? ""}
          placeholder={t("fields.aliasPlaceholder")}
          onCommit={(draft) => {
            const alias = draft.trim();
            const next = { ...field };
            if (alias) next.alias = alias;
            else delete next.alias;
            onChange(next);
          }}
          className="h-7 min-w-0 flex-1 text-xs"
        />
        <SelectField<FieldType>
          label={t("fields.type")}
          value={field.type}
          options={fieldTypeOptions()}
          onChange={(type) => onChange({ ...field, type })}
          className="w-28 shrink-0"
        />
      </div>
      {sample !== "" && (
        <p className="truncate text-xs text-muted-foreground" title={sample}>
          {sample}
        </p>
      )}
    </li>
  );
}
