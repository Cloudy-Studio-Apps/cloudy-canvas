import { useScrubUndo } from "@canvas-ui";
import { FontPicker } from "@design/modules/text/ui/font-picker";
import {
  Checkbox,
  Field,
  NumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import type { OptionFieldProps } from "./picker.types";

/** One template option's control, by its type. */
export function OptionField({ spec, value, onChange }: OptionFieldProps) {
  const scrub = useScrubUndo();
  switch (spec.type) {
    case "boolean":
      return (
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
          label={spec.label}
          className="text-muted-foreground"
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
        <Field label={spec.label} layout="inline">
          <Select value={String(value)} onValueChange={(next) => onChange(next)}>
            <SelectTrigger aria-label={spec.label} className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {spec.choices.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
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
