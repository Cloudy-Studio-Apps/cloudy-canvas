import type { MaskType } from "../../core";
import { t } from "../mask.i18n";

/** The mask types as the Mask section lists them, as in Figma. */
export const MASK_TYPE_OPTIONS: readonly { value: MaskType; label: string }[] = [
  { value: "alpha", label: t("options.alpha") },
  { value: "vector", label: t("options.vector") },
  { value: "luminance", label: t("options.luminance") },
];
