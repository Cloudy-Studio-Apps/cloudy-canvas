import { cn } from "@ui/lib/utils";
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
          "size-5 border border-black/10",
          shape === "circle" ? "rounded-full" : "rounded-xs",
          selected && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
        )}
        style={{ backgroundColor: color }}
      />
    </OptionButton>
  );
}
