import type { FormSectionProps } from "./form-field.types";

/** A titled group of fields, with optional buttons beside the title. */
export function FormSection({ title, actions, children }: FormSectionProps) {
  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}
