/** A color in HSV: hue in degrees (0–360), saturation and value 0–1. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** The color-vision deficiencies the wizard can show a palette with. */
export type CvdKind = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

/** A random number source (0 ≤ n < 1), seeded where palettes must stay the same. */
export type Random = () => number;
