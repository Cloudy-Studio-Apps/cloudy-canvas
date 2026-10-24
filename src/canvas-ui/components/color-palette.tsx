import { ColorSwatch } from "./color-swatch";
import { CustomColorSwatch } from "./custom-color-swatch";
import type { ColorPaletteProps } from "./color-palette.types";

/** A row of color swatches, plus one that picks any other color. */
export function ColorPalette({
  colors,
  value,
  onSelect,
  shape,
  allowCustom = true,
  labelOf = (color) => color.name,
}: ColorPaletteProps) {
  const current = value.toLowerCase();
  const inPalette = colors.some((color) => color.value.toLowerCase() === current);
  return (
    <>
      {colors.map((color) => (
        <ColorSwatch
          key={color.value}
          label={labelOf(color)}
          color={color.value}
          shape={shape}
          selected={color.value.toLowerCase() === current}
          onSelect={() => onSelect(color.value)}
        />
      ))}
      {allowCustom && (
        <CustomColorSwatch color={value} selected={!inPalette} onSelect={onSelect} shape={shape} />
      )}
    </>
  );
}
