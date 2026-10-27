import type { FontPair, WizardType } from "./type.types";
import { t } from "../color-wizard.i18n";

/** Pairs that work together, by mood. */
export const FONT_PAIRS: readonly FontPair[] = [
  { heading: "Fraunces", body: "Inter", mood: t("type.mood.editorial") },
  { heading: "Space Grotesk", body: "IBM Plex Sans", mood: t("type.mood.tech") },
  { heading: "Playfair Display", body: "DM Sans", mood: t("type.mood.elegant") },
  { heading: "Sora", body: "Manrope", mood: t("type.mood.friendly") },
  { heading: "Poppins", body: "Inter", mood: t("type.mood.bold") },
  { heading: "Lora", body: "Lora", mood: t("type.mood.bookish") },
];

/** The modular scale's ratios, by their musical names. */
export const TYPE_RATIOS: readonly { value: number; label: string }[] = [
  { value: 1.125, label: t("type.preset.majorSecond") },
  { value: 1.2, label: t("type.preset.minorThird") },
  { value: 1.25, label: t("type.preset.majorThird") },
  { value: 1.333, label: t("type.preset.perfectFourth") },
  { value: 1.414, label: t("type.preset.augmentedFourth") },
  { value: 1.5, label: t("type.preset.perfectFifth") },
  { value: 1.618, label: t("type.preset.goldenRatio") },
];

export const DEFAULT_WIZARD_TYPE: WizardType = {
  heading: "Inter",
  body: "Inter",
  base: 16,
  ratio: 1.25,
};
