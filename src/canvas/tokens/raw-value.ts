import type { ResolvedValue } from "./token.types";

/** A resolved variable's plain value (a color as `#RRGGBBAA`); `undefined` for a style or none. */
export function rawValue(value: ResolvedValue | null): string | number | boolean | undefined {
  if (!value) return undefined;
  switch (value.type) {
    case "color":
      return value.color;
    case "number":
      return value.number;
    case "string":
      return value.string;
    case "boolean":
      return value.boolean;
    default:
      return undefined;
  }
}
