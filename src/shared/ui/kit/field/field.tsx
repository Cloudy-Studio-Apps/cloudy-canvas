import { useId } from "react";

import { cn } from "@shared/ui/lib/utils";
import { FieldIdContext } from "./field-context";
import type { FieldProps } from "./field.types";

/** A labelled control, with a hint or an error under it. */
export function Field({ label, hint, error, layout = "stacked", children, className }: FieldProps) {
  const id = useId();
  const control = typeof children === "function" ? children(id) : children;
  const note = (error ?? hint) && (
    <p
      id={`${id}-note`}
      className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}
    >
      {error ?? hint}
    </p>
  );
  const labelNode = (
    <label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
    </label>
  );

  return (
    <FieldIdContext.Provider value={id}>
      {layout === "inline" ? (
        <div className={cn("flex items-start justify-between gap-4", className)}>
          <div className="min-w-0 space-y-0.5">
            {labelNode}
            {note}
          </div>
          <div className="shrink-0">{control}</div>
        </div>
      ) : (
        <div className={cn("space-y-1.5", className)}>
          {labelNode}
          {control}
          {note}
        </div>
      )}
    </FieldIdContext.Provider>
  );
}
