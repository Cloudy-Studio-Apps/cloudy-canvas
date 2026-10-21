import { cn } from "@shared/ui/lib/utils";
import { OptionButton } from "./option-button";
import type { ColorSwatchProps } from "./color-swatch.types";

export function ColorSwatch({
  label,
  color,
  selected,
  onSelect,
  shape = "square",
}: ColorSwatchProps) {
  return (
    <OptionButton selected={selected} onClick={onSelect} aria-label={label} title={label}>
      <span
        className={cn(
          "relative size-5 overflow-hidden border border-black/10",
          color === "transparent" && "bg-surface",
          shape === "circle" ? "rounded-full" : "rounded-xs",
          selected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
        )}
        style={{ backgroundColor: color === "transparent" ? undefined : color }}
      >
        {color === "transparent" && <NoColorSlash />}
      </span>
    </OptionButton>
  );
}

/** Diagonal line marking the "no color" swatch. */
function NoColorSlash() {
  return (
    <span className="absolute top-1/2 left-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-destructive" />
  );
}
