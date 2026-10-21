import type { FormFieldProps } from "./form-field.types";

/** A labelled field. */
export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
