import { SelectField } from "@shared/ui/kit";
import { SettingsForm } from "./settings-form";
import type { FormatSelectProps } from "./format-select.types";
import { t } from "../../data.i18n";

const NO_SECRETS: ReadonlySet<string> = new Set();

/** How the data is read: "Automatic" or a format, and the chosen format's options. */
export function FormatSelect({ formats, format, options, onChange }: FormatSelectProps) {
  const chosen = formats.find((item) => item.id === format);
  return (
    <div className="flex flex-col gap-2.5">
      <SelectField
        layout="stacked"
        label={t("source.format")}
        value={chosen ? chosen.id : "auto"}
        options={[
          { value: "auto", label: t("source.formatAuto") },
          ...formats.map((item) => ({ value: item.id, label: item.label })),
        ]}
        onChange={(next) => {
          if (next !== format) onChange(next, {});
        }}
      />
      {chosen?.options && chosen.options.length > 0 && (
        <SettingsForm
          specs={chosen.options}
          values={options}
          stored={NO_SECRETS}
          onChange={(next) => onChange(format, next)}
        />
      )}
    </div>
  );
}
