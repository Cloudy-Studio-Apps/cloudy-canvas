import { cn } from "@shared/ui/lib/utils";
import type { SegmentedControlProps } from "./segmented-control.types";

/** One choice out of a few, as a row of joined buttons (a radio group). */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  iconOnly,
  size = "md",
  fullWidth,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-stretch gap-0.5 rounded-md bg-muted p-0.5",
        size === "sm" ? "h-control-sm" : "h-control",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={iconOnly ? option.label : undefined}
            title={option.title ?? (iconOnly ? option.label : undefined)}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
              iconOnly ? "aspect-square" : "px-2.5",
              fullWidth && "flex-1",
              selected && "bg-surface text-foreground shadow-xs hover:text-foreground",
            )}
          >
            {iconOnly ? (
              option.icon
            ) : (
              <>
                {option.icon}
                <span className="truncate">{option.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
