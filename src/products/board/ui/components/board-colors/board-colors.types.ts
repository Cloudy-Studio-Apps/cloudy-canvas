import type { TokenScope } from "@canvas";
import type { BoardToolOptions } from "@board";

/** A color option of the board's tools, which has a sibling `<option>Token` option. */
export type BoardColorOption =
  | "stickyColor"
  | "shapeFill"
  | "shapeStroke"
  | "sectionColor"
  | "tableColor"
  | "connectorColor"
  | "markerColor";

/** The option holding the variable a color option is bound to. */
export type BoardColorToken = `${BoardColorOption}Token`;

/** A color bar's color: the picked one and the variable it's bound to. */
export interface BoardColor {
  value: BoardToolOptions[BoardColorOption];
  /** The color variable picked, or `null` (a color of the palette or a custom one). */
  token: string | null;
  pickColor: (color: string) => void;
  pickToken: (variableId: string) => void;
}

export interface BoardColorPaletteProps {
  option: BoardColorOption;
  colors: readonly { name: string; value: string }[];
  /** Where variables picked here are offered (the fields the bar colors). */
  scopes: readonly TokenScope[];
  shape?: "square" | "circle";
  labelOf?: (color: { name: string; value: string }) => string;
}

export interface DocumentColorsButtonProps {
  /** The variable bound now (marked, and shown on the button), or `null`. */
  token: string | null;
  scopes: readonly TokenScope[];
  onPick: (variableId: string) => void;
  shape?: "square" | "circle";
}
