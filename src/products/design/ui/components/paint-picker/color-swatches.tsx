import type { ColorSwatchesProps } from "./paint-picker.types";

/** A titled grid of colors to pick from (nothing when there are none). */
export function ColorSwatches({ title, colors, onPick }: ColorSwatchesProps) {
  if (colors.length === 0) return null;
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color.toUpperCase()}
            title={color.toUpperCase()}
            onClick={() => onPick(color)}
            className="size-5 cursor-pointer rounded-xs border border-border-strong hover:ring-2 hover:ring-ring/40"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </section>
  );
}
