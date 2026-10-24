import { cn } from "@shared/ui/lib/utils";
import type { FieldBoxProps } from "./field-box.types";

/**
 * The look of every compact panel field: a muted box that outlines on hover and focus, holding
 * one or more bare inputs (a number, a hex, a percentage) and their labels.
 */
export function FieldBox({ children, className, invalid, title }: FieldBoxProps) {
  return (
    <label
      title={title}
      className={cn(
        "flex h-control-sm min-w-0 items-center gap-1.5 rounded-sm border border-transparent bg-muted px-2 text-xs focus-within:border-ring focus-within:bg-surface hover:border-border",
        invalid && "border-destructive",
        className,
      )}
    >
      {children}
    </label>
  );
}
