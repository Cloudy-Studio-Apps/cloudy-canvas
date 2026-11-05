import { Button, NumberInput } from "@shared/ui/kit";
import { repeatRows } from "../../../data";
import { LimitFields, PreviewRowInput, RepeatRowsFields, SettingRow } from "../../../data/ui";
import { DEFAULT_BROCHURE_DESIGN_LIMIT, repeatSettings, rowsPerPage } from "../../model/repeats";
import type { BrochureRepeatSettingsProps } from "./brochure-repeat-section.types";
import { t } from "../../catalog.i18n";

/**
 * A section's or page's repeat: the list, the row's name, the key, rows per page (pages only),
 * which rows (filter, sort, limit), the copies made while designing (3 unset), the row the
 * template pages show, how many copies its rows make, and Remove repeat. Each change is one step.
 */
export function BrochureRepeatSettings({ state, repeat }: BrochureRepeatSettingsProps) {
  const { scope, apply } = state;
  const settings = repeatSettings(repeat);
  // Every row (the export's), which the copies and the preview row count.
  const rows = repeatRows(settings, scope, "export").rows.length;
  const page = "slot" in state.target;
  const copies = page ? Math.ceil(rows / rowsPerPage(repeat)) : rows;

  return (
    <div className="flex flex-col gap-3">
      <RepeatRowsFields repeat={settings} scope={scope} apply={apply} />
      <div className="flex flex-col gap-1.5">
        {page && (
          <SettingRow label={t("repeat.perPage")}>
            <NumberInput
              label={t("repeat.perPage")}
              value={rowsPerPage(repeat)}
              min={1}
              decimals={0}
              onChange={(perPage) => apply({ perPage })}
              className="min-w-0 flex-1"
            />
          </SettingRow>
        )}
        <LimitFields
          repeat={repeat}
          apply={apply}
          designLabel={t("repeat.designLimit")}
          designDefault={DEFAULT_BROCHURE_DESIGN_LIMIT}
        />
        {rows > 0 && (
          <PreviewRowInput
            count={rows}
            value={repeat.previewRow ?? 0}
            onChange={(previewRow) => apply({ previewRow })}
          />
        )}
        <p className="text-xs text-muted-foreground">
          {t("repeat.copiesFrom", {
            copies: t("repeat.copyCount", { count: copies }),
            count: rows,
          })}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => apply(null)}>
        {t("repeat.remove")}
      </Button>
    </div>
  );
}
