import { cn } from "@shared/ui/lib/utils";
import type { ChoiceCardsProps } from "./choice-cards.types";

/** One choice out of a few, as small cards with a picture each (a radio group). */
export function ChoiceCards<T extends string>({
  label,
  value,
  onChange,
  options,
  columns = 2,
  className,
}: ChoiceCardsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("grid gap-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.title}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-w-0 cursor-pointer flex-col items-center gap-0.5 rounded-md border px-1 pt-1 pb-1.5 text-xs outline-none",
              "focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
            )}
          >
            {option.picture}
            <span className="font-medium">{option.label}</span>
            {option.hint && (
              <span className="text-center text-[11px] leading-tight">{option.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
