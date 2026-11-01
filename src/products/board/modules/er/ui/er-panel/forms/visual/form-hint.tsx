import { cn } from "@shared/ui/kit";
import type { FormHintProps } from "./form-hint.types";

/** A line of explanation in a form. */
export function FormHint({ children, warn }: FormHintProps) {
  return (
    <p className={cn("text-xs", warn ? "text-warning" : "text-muted-foreground")}>{children}</p>
  );
}
