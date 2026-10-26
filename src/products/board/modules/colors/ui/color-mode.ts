import { DEFAULT_VALUE, type TokenStore, type VariableRecord } from "@canvas";

/** The mode a board color is edited in: its axis's current mode (the one shown), or its default. */
export function colorMode(store: TokenStore, variable: VariableRecord): string {
  const axis = variable.axisId ? store.axis(variable.axisId) : null;
  return axis?.current ?? axis?.modes[0]?.id ?? DEFAULT_VALUE;
}
