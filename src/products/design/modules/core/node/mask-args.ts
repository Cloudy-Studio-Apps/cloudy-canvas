import type { MaskType } from "./design-node.types";

/** The mask types, as agents and the panel name them. */
export const MASK_TYPES: readonly MaskType[] = ["alpha", "vector", "luminance"];

/** An agent's mask type, checked. */
export function maskType(value: unknown, field = "maskType"): MaskType {
  const type = MASK_TYPES.find((type) => type === value);
  if (!type) throw new Error(`"${field}" must be one of ${MASK_TYPES.join(", ")}.`);
  return type;
}
