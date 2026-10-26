import { useScrubUndo } from "@canvas-ui";
import { FontPicker } from "../../../text/ui";
import { CheckboxField, Field, NumberInput, SelectField } from "@shared/ui/kit";
import type { OptionFieldProps } from "./picker.types";

/** One template option's control, by its type. */
export function OptionField({ spec, value, onChange }: OptionFieldProps) {
  const scrub = useScrubUndo();
  switch (spec.type) {
    case "boolean":
      return (
        <CheckboxField
          label={spec.label}
          checked={value === true}
          onChange={(checked) => onChange(checked)}
        />
      );
    case "number":
      return (
        <Field label={spec.label} layout="inline">
          <NumberInput
            label={spec.label}
            value={typeof value === "number" ? value : spec.default}
            min={spec.min}
            max={spec.max}
            step={spec.step ?? 1}
            decimals={0}
            onChange={(next) => onChange(next)}
            onScrubStart={scrub.onScrubStart}
            onScrubEnd={scrub.onScrubEnd}
          />
        </Field>
      );
    case "select":
      return (
        <SelectField
          label={spec.label}
          layout="inline"
          value={String(value)}
          options={spec.choices}
          onChange={(next) => onChange(next)}
        />
      );
    case "font":
      return (
        <Field label={spec.label}>
          <FontPicker
            family={typeof value === "string" ? value : spec.default}
            onPick={(font) => onChange(font.family)}
          />
        </Field>
      );
  }
}
