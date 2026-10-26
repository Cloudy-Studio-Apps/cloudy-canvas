import type { MaskType } from "../../core";

/** The mask types as the Mask section lists them, as in Figma. */
export const MASK_TYPE_OPTIONS: readonly { value: MaskType; label: string }[] = [
  { value: "alpha", label: "Alpha" },
  { value: "vector", label: "Vector (outline)" },
  { value: "luminance", label: "Luminance" },
];
