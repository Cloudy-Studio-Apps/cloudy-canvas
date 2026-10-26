import { cn } from "@shared/ui/kit";
import type { SegmentedProps } from "./generator.types";

/** A labelled row of choices, one picked. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md bg-muted p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-6 flex-1 rounded-sm text-xs text-muted-foreground",
              option.value === value && "bg-surface font-medium text-foreground shadow-xs",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
