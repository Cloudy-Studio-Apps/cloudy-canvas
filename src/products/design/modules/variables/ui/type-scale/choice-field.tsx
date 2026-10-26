import {
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import type { ChoiceFieldProps } from "./type-scale-ui.types";

/** A labelled select of the type scale form. */
export function ChoiceField({ label, value, choices, onChange }: ChoiceFieldProps) {
  return (
    <Field label={label} layout="inline">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="h-7 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
