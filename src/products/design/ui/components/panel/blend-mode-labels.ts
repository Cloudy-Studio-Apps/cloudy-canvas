import type { LayerBlendMode } from "@design";

/** Figma's blend menu: its groups in order, each mode with its label. */
export const BLEND_MODE_GROUPS: readonly (readonly { value: LayerBlendMode; label: string }[])[] = [
  [
    { value: "pass-through", label: "Pass through" },
    { value: "normal", label: "Normal" },
  ],
  [
    { value: "darken", label: "Darken" },
    { value: "multiply", label: "Multiply" },
    { value: "plus-darker", label: "Plus darker" },
    { value: "color-burn", label: "Color burn" },
  ],
  [
    { value: "lighten", label: "Lighten" },
    { value: "screen", label: "Screen" },
    { value: "plus-lighter", label: "Plus lighter" },
    { value: "color-dodge", label: "Color dodge" },
  ],
  [
    { value: "overlay", label: "Overlay" },
    { value: "soft-light", label: "Soft light" },
    { value: "hard-light", label: "Hard light" },
  ],
  [
    { value: "difference", label: "Difference" },
    { value: "exclusion", label: "Exclusion" },
  ],
  [
    { value: "hue", label: "Hue" },
    { value: "saturation", label: "Saturation" },
    { value: "color", label: "Color" },
    { value: "luminosity", label: "Luminosity" },
  ],
];
