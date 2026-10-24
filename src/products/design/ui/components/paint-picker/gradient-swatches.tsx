import { gradientKey } from "@canvas";
import { CHECKERBOARD } from "@canvas-ui";
import type { GradientSwatchesProps } from "./paint-picker.types";
import { gradientPreviewCss } from "./gradient-preview";

/** A titled grid of gradients to pick from (nothing when there are none). */
export function GradientSwatches({ title, gradients, onPick }: GradientSwatchesProps) {
  if (gradients.length === 0) return null;
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {gradients.map((gradient) => (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a gradient swatch
          <button
            key={gradientKey(gradient)}
            type="button"
            aria-label={`${gradient.type} gradient`}
            title={`${gradient.type[0]!.toUpperCase()}${gradient.type.slice(1)}`}
            onClick={() => onPick(gradient)}
            className="size-5 cursor-pointer rounded-xs border border-border-strong hover:ring-2 hover:ring-ring/40"
            style={{ background: `${gradientPreviewCss(gradient)}, ${CHECKERBOARD}` }}
          />
        ))}
      </div>
    </section>
  );
}
