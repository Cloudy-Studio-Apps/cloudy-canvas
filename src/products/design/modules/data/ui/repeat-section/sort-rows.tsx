import { ArrowDownWideNarrow, ArrowUpNarrowWide, Plus, X } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import type { SortRule } from "../../repeat";
import { FieldPicker } from "../data-section/field-picker";
import { FieldPickerButton } from "../data-section/field-picker-button";
import type { SortRowsProps } from "./sort-rows.types";
import { t } from "../../data.i18n";

/** "Sort by": the repeat's sort rules, the first deciding first, each up or down; + adds one. */
export function SortRows({ sort, names, onChange }: SortRowsProps) {
  const replace = (at: number, rule: SortRule) =>
    onChange(sort.map((item, i) => (i === at ? rule : item)));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-xs font-medium text-foreground">{t("repeat.sort.title")}</p>
        <FieldPicker names={names} onPick={(path) => onChange([...sort, { path }])}>
          <IconButton size="xs" label={t("repeat.sort.add")}>
            <Plus />
          </IconButton>
        </FieldPicker>
      </div>
      {sort.map((rule, at) => (
        // Rules have no id: their place is who they are.
        <div key={at} className="flex min-w-0 items-center gap-1.5">
          <FieldPickerButton
            names={names}
            value={rule.path}
            onPick={(path) => replace(at, { ...rule, path })}
          />
          <IconButton
            size="xs"
            label={t(rule.descending ? "repeat.sort.descending" : "repeat.sort.ascending")}
            onClick={() =>
              replace(
                at,
                rule.descending ? { path: rule.path } : { path: rule.path, descending: true },
              )
            }
          >
            {rule.descending ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
          </IconButton>
          <IconButton
            size="xs"
            label={t("repeat.sort.remove")}
            onClick={() => onChange(sort.filter((_, i) => i !== at))}
          >
            <X />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
