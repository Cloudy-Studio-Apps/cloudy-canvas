import type { ImageDefaults } from "./image.types";
import { t } from "./image.i18n";

/** Pasted images start transparent and without padding; paddings are in world units. */
export const IMAGE_DEFAULTS = {
  background: "none",
  padding: 0,
  backgrounds: ["none", "white"],
  maxPadding: 256,
  paddings: [
    { name: t("paddings.none"), value: 0 },
    { name: t("paddings.small"), value: 16 },
    { name: t("paddings.medium"), value: 32 },
    { name: t("paddings.large"), value: 64 },
  ],
  fitInView: 0.8,
} as const satisfies ImageDefaults;
