import { cn } from "@shared/ui/lib/utils";
import type { FlagToggleProps } from "./flag-toggle.types";

/** Small on/off chip for a constraint like PK or UQ. */
export function FlagToggle({ label, title, on, onToggle, disabled }: FlagToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-disabled={disabled}
      title={title}
      className={cn(
        "h-6 cursor-pointer rounded-sm border px-1.5 text-[11px] font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        on
          ? "border-primary bg-primary-soft text-primary-soft-foreground"
          : "border-border text-muted-foreground hover:bg-hover",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
      onClick={disabled ? undefined : onToggle}
    >
      {label}
    </button>
  );
}
