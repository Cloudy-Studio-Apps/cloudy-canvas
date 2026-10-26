import { ColorPalette } from "@canvas-ui";
import { DocumentColorsButton } from "./document-colors-button";
import type { BoardColorPaletteProps } from "./board-colors.types";
import { useBoardColor } from "./use-board-color";

/**
 * A board color bar: the board's colors first, then the palette and a custom color. A board color
 * binds what the bar colors to it (new elements too); another color unbinds it.
 */
export function BoardColorPalette({
  option,
  colors,
  scopes,
  shape,
  labelOf,
}: BoardColorPaletteProps) {
  const color = useBoardColor(option);
  return (
    <>
      <DocumentColorsButton
        token={color.token}
        scopes={scopes}
        onPick={color.pickToken}
        shape={shape}
      />
      <ColorPalette
        colors={colors}
        value={color.value}
        onSelect={color.pickColor}
        shape={shape}
        labelOf={labelOf}
        noneSelected={!!color.token}
      />
    </>
  );
}
