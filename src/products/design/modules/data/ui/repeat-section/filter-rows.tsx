import { Plus } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { ConditionField } from "../data-section/condition-field";
import { FieldPicker } from "../data-section/field-picker";
import type { FilterRowsProps } from "./filter-rows.types";
import { t } from "../../data.i18n";

/** "Only rows where": the repeat's conditions, all of which a row must meet; + adds one. */
export function FilterRows({ filter, names, onChange }: FilterRowsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-xs font-medium text-foreground">{t("repeat.filter.title")}</p>
        <FieldPicker names={names} onPick={(path) => onChange([...filter, { path, op: "exists" }])}>
          <IconButton size="xs" label={t("repeat.filter.add")}>
            <Plus />
          </IconButton>
        </FieldPicker>
      </div>
      {filter.map((condition, at) => (
        <ConditionField
          // Conditions have no id: their place is who they are.
          key={at}
          condition={condition}
          names={names}
          onChange={(next) =>
            onChange(
              next
                ? filter.map((item, i) => (i === at ? next : item))
                : filter.filter((_, i) => i !== at),
            )
          }
        />
      ))}
    </div>
  );
}
