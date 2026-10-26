import { PaintField } from "@design/ui/components/panel";
import { solidPaint } from "../../core";
import type { TypographyControlProps } from "./typography-controls.types";

/** The color of the selected characters while a text is edited (their first fill). */
export function RangeColorField({ target }: TypographyControlProps) {
  const fills = target.read("fills");
  const paint = fills?.[0] ?? solidPaint("#000000");
  return (
    <PaintField
      paint={paint}
      label="Selection color"
      allowImage={false}
      onChange={(next, info) => {
        if (info.done) target.set({ fills: [next] });
      }}
      onRemove={() => target.set({ fills: [] })}
    />
  );
}
