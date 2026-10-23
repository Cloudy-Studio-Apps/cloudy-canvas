import { cn } from "@shared/ui/lib/utils";
import type { HierarchyChoiceProps, StrategyOption } from "./er-to-tables.types";
import { StrategyPicture } from "./strategy-picture";

const STRATEGIES: readonly StrategyOption[] = [
  {
    value: "per-entity",
    label: "One table per entity",
    hint: "Children keyed by the parent's key.",
  },
  {
    value: "single",
    label: "One table for all",
    hint: "Every column in the parent's table, with a discriminator.",
  },
];

/** How one hierarchy becomes tables, as two cards with a picture each. */
export function HierarchyChoice({ label, value, onChange }: HierarchyChoiceProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">{label}</p>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1.5">
        {STRATEGIES.map((strategy) => (
          <button
            key={strategy.value}
            type="button"
            role="radio"
            aria-checked={value === strategy.value}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-md border px-1 pt-1 pb-1.5 text-xs outline-none",
              "focus-visible:ring-[3px] focus-visible:ring-ring/25",
              value === strategy.value
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
            )}
            onClick={() => onChange(strategy.value)}
          >
            <StrategyPicture strategy={strategy.value} />
            <span className="font-medium">{strategy.label}</span>
            <span className="text-center text-[11px] leading-tight">{strategy.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
