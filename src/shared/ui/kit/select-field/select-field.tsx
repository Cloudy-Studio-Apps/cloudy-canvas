import { cn } from "@shared/ui/lib/utils";
import { Field } from "../field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../primitives";
import type { SelectFieldProps } from "./select-field.types";

/** A compact select of a list of options, alone or labelled in a `Field`. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  layout = "bare",
  placeholder,
  disabled,
  className,
}: SelectFieldProps<T>) {
  const select = (id?: string) => (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        const option = options.find((item) => item.value === next);
        if (option) onChange(option.value);
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        title={layout === "bare" ? label : undefined}
        className={cn("h-7 w-full text-xs", layout === "bare" && className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  if (layout === "bare") return select();
  return (
    <Field label={label} layout={layout} className={className}>
      {(id) => select(id)}
    </Field>
  );
}
