import { OptionField } from "./option-field";
import type { TemplateOptionsProps } from "./picker.types";

/** The chosen template's options, each written as it changes. */
export function TemplateOptions({ template, options, onChange }: TemplateOptionsProps) {
  if (template.options.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {template.options.map((spec) => (
        <OptionField
          key={spec.id}
          spec={spec}
          value={options[spec.id]}
          onChange={(value) => onChange({ ...options, [spec.id]: value })}
        />
      ))}
    </div>
  );
}
