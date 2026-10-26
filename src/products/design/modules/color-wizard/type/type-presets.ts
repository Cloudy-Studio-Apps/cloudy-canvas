import type { FontPair, WizardType } from "./type.types";

/** Pairs that work together, by mood. */
export const FONT_PAIRS: readonly FontPair[] = [
  { heading: "Fraunces", body: "Inter", mood: "Editorial, warm" },
  { heading: "Space Grotesk", body: "IBM Plex Sans", mood: "Tech, precise" },
  { heading: "Playfair Display", body: "DM Sans", mood: "Elegant" },
  { heading: "Sora", body: "Manrope", mood: "Friendly product" },
  { heading: "Poppins", body: "Inter", mood: "Bold, simple" },
  { heading: "Lora", body: "Lora", mood: "Bookish" },
];

/** The modular scale's ratios, by their musical names. */
export const TYPE_RATIOS: readonly { value: number; label: string }[] = [
  { value: 1.125, label: "Major second" },
  { value: 1.2, label: "Minor third" },
  { value: 1.25, label: "Major third" },
  { value: 1.333, label: "Perfect fourth" },
  { value: 1.414, label: "Augmented fourth" },
  { value: 1.5, label: "Perfect fifth" },
  { value: 1.618, label: "Golden ratio" },
];

export const DEFAULT_WIZARD_TYPE: WizardType = {
  heading: "Inter",
  body: "Inter",
  base: 16,
  ratio: 1.25,
};
