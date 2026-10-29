import { SelectField, SwitchField } from "@shared/ui/kit";
import type { TargetFieldsProps } from "./target-fields.types";
import { t } from "../db-export.i18n";

/** The framework, its version and the options it declares. */
export function TargetFields({
  targets,
  target,
  profile,
  options,
  onTarget,
  onProfile,
  onOption,
}: TargetFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <SelectField
        layout="stacked"
        label={t("dialog.target")}
        value={target.id}
        options={targets.map((each) => ({ value: each.id, label: each.label }))}
        onChange={onTarget}
      />
      <SelectField
        layout="stacked"
        label={t("dialog.version")}
        value={profile}
        options={target.profiles.map((each) => ({ value: each.id, label: each.label }))}
        onChange={onProfile}
        disabled={target.profiles.length < 2}
      />
      {target.options.map((option) =>
        option.kind === "select" ? (
          <SelectField
            key={option.id}
            layout="stacked"
            label={option.label()}
            value={String(options[option.id] ?? option.default)}
            options={option.choices.map((choice) => ({
              value: choice.value,
              label: choice.label(),
            }))}
            onChange={(value) => onOption(option.id, value)}
          />
        ) : (
          <SwitchField
            key={option.id}
            label={option.label()}
            checked={options[option.id] === true}
            onChange={(checked) => onOption(option.id, checked)}
          />
        ),
      )}
    </div>
  );
}
