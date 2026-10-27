import { SelectField } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";
import type { SourceFieldsProps } from "./sheet-section.types";
import { t } from "../../styleguide.i18n";

/** The value the group select shows for "the whole category". */
const WHOLE = "__whole__";

/** What a live element shows: a category, and all of it or one group. */
export function SourceFields({ sheet, outline }: SourceFieldsProps) {
  const { styleguide } = useStyleguide();
  const entry = outline.find((item) => item.category.id === sheet.sheet.category);
  return (
    <div className="flex flex-col gap-2">
      <SelectField
        label={t("sidebar.source.category")}
        layout="inline"
        value={sheet.sheet.category}
        options={outline.map((item) => ({ value: item.category.id, label: item.category.label }))}
        onChange={(category) =>
          // Another category: its own default template, all of it.
          styleguide.setSheet(sheet.id, {
            category,
            group: undefined,
            template: null,
            options: null,
          })
        }
      />
      {entry && entry.groups.length > 1 && (
        <SelectField
          label={t("sidebar.source.group")}
          layout="inline"
          value={sheet.sheet.group ?? WHOLE}
          options={[
            { value: WHOLE, label: t("sidebar.source.wholeCategory") },
            ...entry.groups.map((group) => ({
              value: group.id,
              label: group.title || entry.category.label,
            })),
          ]}
          onChange={(group) =>
            styleguide.setSheet(sheet.id, { group: group === WHOLE ? undefined : group })
          }
        />
      )}
    </div>
  );
}
