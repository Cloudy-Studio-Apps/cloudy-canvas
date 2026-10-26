import { tokenOption } from "@board";
import { useDocumentTokens } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { boardColorValue } from "./board-color-value";
import type { BoardColor, BoardColorOption, BoardColorToken } from "./board-colors.types";

/**
 * A color bar's color option and its variable: picking a color unbinds it, picking a variable
 * binds it (for new elements and the selected ones, in one undo step).
 */
export function useBoardColor(option: BoardColorOption): BoardColor {
  const engine = useBoardEngine();
  const key = tokenOption(option) as BoardColorToken;
  const value = useBoardState((state) => state.options[option]);
  const stored = useBoardState((state) => state.options[key]);
  const { store } = useDocumentTokens();
  // A variable deleted since it was picked is no longer bound.
  const token = typeof stored === "string" && store.variable(stored) ? stored : null;
  return {
    value,
    token,
    pickColor: (color) => engine.setToolOptions({ [option]: color, [key]: null }),
    pickToken: (id) => {
      const color = boardColorValue(engine.doc, id);
      if (color) engine.setToolOptions({ [option]: color, [key]: id });
    },
  };
}
