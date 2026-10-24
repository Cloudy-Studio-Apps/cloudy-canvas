import { readParent } from "./binding-path";
import { splitTokenColor } from "./token-color";
import type { ResolvedValue } from "./token.types";

/**
 * The stored values a variable's value gives the field at `path` of `container` (paths →
 * values). A color at a `….color` path whose parent has an `opacity` also sets that opacity from
 * its alpha (a paint, an effect); elsewhere it's stored as hex, with its alpha when translucent.
 * Styles aren't values of one field: kinds spread them themselves.
 */
export function tokenValueFields(
  container: object,
  path: string,
  value: ResolvedValue,
): Record<string, unknown> {
  if (value.type === "style") return {};
  if (value.type === "number") return { [path]: value.number };
  if (value.type === "string") return { [path]: value.string };
  if (value.type === "boolean") return { [path]: value.boolean };
  const { hex, alpha } = splitTokenColor(value.color);
  const parent = readParent(container, path);
  if (path.endsWith(".color") && typeof parent?.opacity === "number") {
    return { [path]: hex, [`${path.slice(0, -".color".length)}.opacity`]: alpha };
  }
  return { [path]: alpha < 1 ? value.color : hex };
}
