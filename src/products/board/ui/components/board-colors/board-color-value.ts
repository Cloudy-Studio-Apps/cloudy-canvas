import { resolveVariable, splitTokenColor, TokenStore, type CanvasDocument } from "@canvas";

/**
 * A color variable's color on the board now (each axis's current mode), as board fields store it:
 * `#RRGGBB`, with its alpha when translucent. `null` when it doesn't resolve to a color.
 */
export function boardColorValue(doc: CanvasDocument, variableId: string): string | null {
  const value = resolveVariable(TokenStore.of(doc), variableId, {});
  if (value?.type !== "color") return null;
  const { hex, alpha } = splitTokenColor(value.color);
  return alpha < 1 ? value.color : hex;
}
