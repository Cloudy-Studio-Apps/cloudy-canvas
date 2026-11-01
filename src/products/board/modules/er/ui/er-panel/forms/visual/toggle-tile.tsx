import { cn } from "@shared/ui/kit";
import type { ToggleTileProps } from "./toggle-tile.types";

/** An on/off option shown with its picture and what it means. */
export function ToggleTile({
  picture,
  label,
  hint,
  on,
  title,
  disabled,
  stacked,
  onToggle,
}: ToggleTileProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: ChoiceCards picks one, these toggle
    <button
      type="button"
      aria-pressed={on}
      aria-disabled={disabled}
      title={title}
      className={cn(
        "flex min-w-0 cursor-pointer gap-1.5 rounded-md border p-1.5 text-xs outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        stacked ? "flex-col items-center text-center" : "items-center text-left",
        on
          ? "border-primary bg-primary-soft text-primary-soft-foreground"
          : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <span className="shrink-0">{picture}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{label}</span>
        <span className="text-[11px] leading-tight">{hint}</span>
      </span>
    </button>
  );
}
