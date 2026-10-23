import { cn } from "@shared/ui/lib/utils";
import type { EffectChoiceProps } from "./fields.types";

/** A segmented choice of an effect's editor (Uniform / Progressive, Mono / Duo / Multi). */
export function EffectChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: EffectChoiceProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-sm bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-6 flex-1 cursor-pointer rounded-xs text-xs text-muted-foreground hover:text-foreground",
            option.value === value && "bg-surface text-foreground shadow-xs",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
