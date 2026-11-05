import { X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { repeatRows, rowScope } from "../../repeat";
import { FieldPickerButton } from "../data-section/field-picker-button";
import { pickerNames } from "../data-section/picker-names";
import { FilterRows } from "./filter-rows";
import { listNames } from "./list-names";
import { SettingRow } from "./setting-row";
import { SortRows } from "./sort-rows";
import type { RepeatRowsFieldsProps } from "./repeat-rows-fields.types";
import { t } from "../../data.i18n";

/**
 * Which rows a repeat reads, wherever it repeats (a card, a brochure's section or page): the list
 * (one of `scope`'s), the row's name, the key, and the filter and sort, which read the row's fields.
 */
export function RepeatRowsFields({ repeat, scope, apply }: RepeatRowsFieldsProps) {
  const rows = repeatRows(repeat, scope, "design");
  const first = rows.rows[0];
  // The row's own fields (`item.price`), which the key, filter and sort read.
  const fields = pickerNames(
    rowScope(scope, repeat, first?.row, first?.index ?? 0, rows.total),
  ).filter((name) => name.group === repeat.as);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SettingRow label={t("repeat.list")}>
          <FieldPickerButton
            names={listNames(scope)}
            value={repeat.source}
            label={t("repeat.list")}
            onPick={(source) => apply({ source })}
          />
        </SettingRow>
        <SettingRow label={t("repeat.rowName")}>
          <CommitInput
            aria-label={t("repeat.rowName")}
            value={repeat.as}
            onCommit={(as) => apply({ as })}
            className="h-7 min-w-0 flex-1 text-xs"
          />
        </SettingRow>
        <SettingRow label={t("repeat.key")}>
          <FieldPickerButton
            names={fields}
            value={repeat.key}
            label={t("repeat.key")}
            placeholder={t("repeat.keyNone")}
            onPick={(key) => apply({ key })}
          />
          {repeat.key !== undefined && (
            <IconButton
              size="xs"
              label={t("repeat.keyClear")}
              onClick={() => apply({ key: undefined })}
            >
              <X />
            </IconButton>
          )}
        </SettingRow>
      </div>
      <FilterRows filter={repeat.filter} names={fields} onChange={(filter) => apply({ filter })} />
      <SortRows sort={repeat.sort} names={fields} onChange={(sort) => apply({ sort })} />
    </>
  );
}
