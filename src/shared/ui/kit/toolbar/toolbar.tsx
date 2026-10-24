import { cn } from "@shared/ui/lib/utils";
import type { ToolbarGroupProps, ToolbarProps } from "./toolbar.types";

/** A floating bar of tools: a card with groups of buttons split by rules. */
export function Toolbar({ label, className, ...props }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn(
        "flex items-center gap-1 rounded-card border bg-surface p-1 shadow-lifted",
        className,
      )}
      {...props}
    />
  );
}

/** A group of a toolbar's buttons; groups after the first are split from it by a rule. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        "flex items-center gap-0.5 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-1",
        className,
      )}
      {...props}
    />
  );
}
