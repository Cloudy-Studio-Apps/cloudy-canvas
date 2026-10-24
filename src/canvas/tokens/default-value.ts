import type { TokenValue, VariableType } from "./token.types";

/** The key of a variable's default value in its `values` (see `VariableRecord`). */
export const DEFAULT_VALUE = "default";

/** A new variable's value when none is given: black, 0, an empty text, false. */
export function defaultValueOf(type: VariableType): TokenValue {
  if (type === "color") return { color: "#000000FF" };
  if (type === "number") return { number: 0 };
  if (type === "string") return { string: "" };
  return { boolean: false };
}
