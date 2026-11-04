import { SettingField } from "./setting-field";
import type { SettingsFormProps } from "./settings-form.types";

/** The generic settings form: one field per spec of a source type or format. */
export function SettingsForm({ specs, values, stored, onChange, onFilePicked }: SettingsFormProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {specs.map((spec) => (
        <SettingField
          key={spec.key}
          spec={spec}
          value={values[spec.key]}
          stored={stored}
          onChange={(value) => onChange({ ...values, [spec.key]: value })}
          onFilePicked={onFilePicked}
        />
      ))}
    </div>
  );
}
