import type { ImageDefaults } from "./image.types";

/** Pasted images start transparent and without padding; paddings are in world units. */
export const IMAGE_DEFAULTS = {
  background: "none",
  padding: 0,
  backgrounds: ["none", "white"],
  maxPadding: 256,
  paddings: [
    { name: "None", value: 0 },
    { name: "Small", value: 16 },
    { name: "Medium", value: 32 },
    { name: "Large", value: 64 },
  ],
  fitInView: 0.8,
} as const satisfies ImageDefaults;
