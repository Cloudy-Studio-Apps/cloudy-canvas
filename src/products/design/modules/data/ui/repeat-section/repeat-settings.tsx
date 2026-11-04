import { X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { Button, IconButton } from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { repeatRows, rowScope, scopeAt } from "../../repeat";
import { FieldPickerButton } from "../data-section/field-picker-button";
import { pickerNames } from "../data-section/picker-names";
import { FilterRows } from "./filter-rows";
import { LimitFields } from "./limit-fields";
import { listNames } from "./list-names";
import { SettingRow } from "./setting-row";
import { SortRows } from "./sort-rows";
import type { RepeatSettingsProps } from "./repeat-settings.types";
import { t } from "../../data.i18n";

/**
 * A frame's repeat: the list, the row's name, the key, which rows (filter, sort, limits), how
 * many show, and Remove repeat. Each change is one `setRepeat` step.
 */
export function RepeatSettingsBlock({ frameId, repeat, apply }: RepeatSettingsProps) {
  const engine = useDesignEngine();
  const scope = scopeAt(engine.doc, frameId);
  const rows = repeatRows(repeat, scope, "design");
  const first = rows.rows[0];
  // The row's own fields (`item.price`), which the key, filter and sort read.
  const fields = pickerNames(
    rowScope(scope, repeat, first?.row, first?.index ?? 0, rows.total),
  ).filter((name) => name.group === repeat.as);

  return (
    <div className="flex flex-col gap-3">
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
      <div className="flex flex-col gap-1.5">
        <LimitFields repeat={repeat} apply={apply} />
        <p className="text-xs text-muted-foreground">
          {t("repeat.count", { shown: rows.rows.length, count: rows.total })}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => apply(null)}>
        {t("repeat.remove")}
      </Button>
    </div>
  );
}
